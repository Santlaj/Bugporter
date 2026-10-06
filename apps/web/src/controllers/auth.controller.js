import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { getServerSession } from "next-auth/next";
import { userModel, organizationModel } from "../models";
import { hashPassword, verifyPassword } from "../lib/auth-utils";
import { UnauthorizedError, ValidationError } from "../lib/errors";
import prisma from "../lib/prisma";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "missing-google-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "missing-google-client-secret",
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Account Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "developer@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter both email and password.");
        }

        const email = credentials.email.toLowerCase().trim();
        const user = await userModel.findByEmail(email);

        if (!user) {
          throw new Error("No account found with this email. Please sign up first.");
        }

        // Handle legacy accounts or verify hashed password
        if (user.password) {
          const isValid = verifyPassword(credentials.password, user.password);
          if (!isValid) {
            throw new Error("Incorrect password. Please try again.");
          }
        } else {
          // If created previously without password, set password on first login
          const hashedPassword = hashPassword(credentials.password);
          await userModel.update(user.id, { password: hashedPassword });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        if (!user?.email) return false;
        const normalizedEmail = user.email.toLowerCase().trim();
        let dbUser = await userModel.findByEmail(normalizedEmail);

        if (!dbUser) {
          const displayName = user.name || normalizedEmail.split("@")[0];
          dbUser = await userModel.create({
            email: normalizedEmail,
            name: displayName,
            image: user.image || null,
          });

          const org = await organizationModel.create({
            name: `${displayName}'s Workspace`,
            slug: `workspace-${dbUser.id.slice(-6)}`,
            ownerId: dbUser.id,
          });

          // Transfer existing projects from demo/developer placeholder to newly registered owner
          try {
            const devUser = await userModel.findByEmail("developer@bugreporter.local");
            if (devUser) {
              const devOrgs = await organizationModel.findByOwnerId(devUser.id);
              for (const devOrg of devOrgs) {
                await prisma.project.updateMany({
                  where: { organizationId: devOrg.id },
                  data: { organizationId: org.id },
                });
              }
            }
          } catch (err) {
            console.warn("Could not transfer existing projects:", err.message);
          }
        } else {
          if (user.image && !dbUser.image) {
            await userModel.update(dbUser.id, { image: user.image });
          }
        }

        user.id = dbUser.id;
        return true;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "bug-reporter-production-auth-secret-key-32chars",
};

export const authController = {
  /**
   * Registers a new user with secure password hashing and workspace provisioning.
   */
  async register({ email, password, name }) {
    if (!email || !email.includes("@")) {
      throw new ValidationError("A valid email address is required.");
    }

    if (!password || password.length < 6) {
      throw new ValidationError("Password must be at least 6 characters long.");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await userModel.findByEmail(normalizedEmail);

    if (existing) {
      throw new ValidationError("An account with this email already exists. Please log in.");
    }

    const hashedPassword = hashPassword(password);
    const displayName = (name && name.trim()) || normalizedEmail.split("@")[0];

    // Create user
    const user = await userModel.create({
      email: normalizedEmail,
      password: hashedPassword,
      name: displayName,
    });

    // Create primary workspace organization
    const org = await organizationModel.create({
      name: `${displayName}'s Workspace`,
      slug: `workspace-${user.id.slice(-6)}`,
      ownerId: user.id,
    });

    // Transfer any existing projects from demo/developer placeholder to newly registered owner
    try {
      const devUser = await userModel.findByEmail("developer@bugreporter.local");
      if (devUser) {
        const devOrgs = await organizationModel.findByOwnerId(devUser.id);
        for (const devOrg of devOrgs) {
          await prisma.project.updateMany({
            where: { organizationId: devOrg.id },
            data: { organizationId: org.id },
          });
        }
      }
    } catch (err) {
      console.warn("Could not transfer existing projects:", err.message);
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  },

  /**
   * Retrieves active server session and user record.
   * Returns null if unauthenticated so protected pages can enforce redirect to /login.
   */
  async getCurrentUser() {
    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        const user = await userModel.findById(session.user.id);
        if (user) return user;
      }
    } catch {}

    return null;
  },

  /**
   * Ensures the request is authenticated, throwing UnauthorizedError if not.
   */
  async requireAuth() {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new UnauthorizedError("You must be signed in to access this page.");
    }
    return user;
  },
};

export default authController;
