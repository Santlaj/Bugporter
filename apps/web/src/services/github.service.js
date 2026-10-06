import crypto from "crypto";

/**
 * Creates a signed JWT for GitHub App authentication.
 * Uses standard RS256 with Node.js crypto.
 * @returns {string}
 */
function generateAppJwt() {
  const rawKey = process.env.GITHUB_APP_PRIVATE_KEY;
  const privateKey = rawKey?.includes("\\n") ? rawKey.replace(/\\n/g, "\n") : rawKey;

  if (!appId || !privateKey) {
    throw new Error("GitHub App credentials (GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY) not configured.");
  }

  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now - 60, // Issued 60 seconds ago for clock drift
    exp: now + 600, // Expires in 10 minutes (max allowed by GitHub)
    iss: appId,
  };

  const base64UrlEncode = (obj) =>
    Buffer.from(JSON.stringify(obj))
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

  const unsignedToken = `${base64UrlEncode(header)}.${base64UrlEncode(payload)}`;

  const sign = crypto.createSign("RSA-SHA256");
  sign.update(unsignedToken);
  const signature = sign
    .sign(privateKey, "base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${unsignedToken}.${signature}`;
}

export const githubService = {
  /**
   * Generates a temporary installation access token (valid for 1 hour).
   * @param {string} installationId
   * @returns {Promise<string>}
   */
  async getInstallationToken(installationId) {
    const jwt = generateAppJwt();

    const res = await fetch(`https://api.github.com/app/installations/${installationId}/access_tokens`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "Bug-Reporter-App",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to obtain GitHub installation token: ${res.status}`);
    }

    const data = await res.json();
    return data.token;
  },

  /**
   * Lists repositories accessible to this GitHub App installation.
   * @param {string} installationId
   */
  async listRepositories(installationId) {
    const token = await this.getInstallationToken(installationId);

    const res = await fetch("https://api.github.com/installation/repositories", {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "Bug-Reporter-App",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to list GitHub repositories: ${res.status}`);
    }

    const data = await res.json();
    return data.repositories || [];
  },

  /**
   * Creates an issue in the target repository.
   * @param {object} params
   * @param {string} params.installationId
   * @param {string} params.owner
   * @param {string} params.repo
   * @param {string} params.title
   * @param {string} params.body
   * @param {string[]} [params.labels]
   */
  async createIssue({ installationId, owner, repo, title, body, labels = ["bug", "bug-reporter"] }) {
    const token = await this.getInstallationToken(installationId);

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
      method: "POST",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "Bug-Reporter-App",
      },
      body: JSON.stringify({
        title,
        body,
        labels,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to create GitHub issue: ${res.status} - ${errText}`);
    }

    return res.json();
  },
};

export default githubService;
