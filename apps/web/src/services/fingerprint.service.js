import crypto from "crypto";

/**
 * Extracts the top relevant stack frame from an error stack string.
 * @param {string} stack
 * @returns {string}
 */
function extractTopStackFrame(stack) {
  if (!stack || typeof stack !== "string") return "";

  const lines = stack.split("\n");
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("at ")) {
      // Return normalized frame removing specific line/col numbers
      return line.replace(/:\d+:\d+/g, "").slice(0, 150);
    }
  }

  return "";
}

/**
 * Generates duplicate grouping fingerprint.
 * SHA-256 of: normalized message + top stack frame + route
 * @param {object} params
 * @param {string} params.message
 * @param {string} [params.route]
 * @param {string} [params.stack]
 * @returns {string}
 */
export function generateFingerprint({ message = "", route = "", stack = "" } = {}) {
  const normMessage = (message || "").toLowerCase().trim().replace(/\s+/g, " ").slice(0, 200);
  const normRoute = (route || "").toLowerCase().trim();
  const topFrame = extractTopStackFrame(stack);

  const raw = `${normMessage}|${topFrame}|${normRoute}`;

  return crypto.createHash("sha256").update(raw).digest("hex");
}

export const fingerprintService = {
  generateFingerprint,
};

export default fingerprintService;
