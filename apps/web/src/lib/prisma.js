import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: [
      { level: "warn", emit: "stdout" },
      { level: "error", emit: "event" },
    ],
  });

// Gracefully handle serverless idle socket disconnects (Neon PgBouncer auto-reconnect)
if (typeof prisma.$on === "function") {
  prisma.$on("error", (e) => {
    const msg = e.message || String(e);
    if (
      msg.includes("Closed") ||
      msg.includes("ConnectionReset") ||
      msg.includes("10054") ||
      msg.includes("remote host")
    ) {
      // Normal Neon serverless idle socket closure; Prisma auto-reconnects on next query
      return;
    }
    console.error("[Prisma Error]:", msg);
  });
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Auto-ensure password column exists in PostgreSQL (Neon DB)
if (typeof prisma.$executeRawUnsafe === "function") {
  prisma
    .$executeRawUnsafe('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password" TEXT;')
    .catch(() => {});
}

export default prisma;
