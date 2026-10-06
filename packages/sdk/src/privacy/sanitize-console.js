import { sanitizeUrl } from "./sanitize-url";

const SENSITIVE_PATTERNS = [
  /(bearer\s+)[a-zA-Z0-9_\-\.]{15,}/gi,
  /(password["']?\s*[:=]\s*["']?)[^"'\s,}]+/gi,
  /(secret["']?\s*[:=]\s*["']?)[^"'\s,}]+/gi,
  /(api_?key["']?\s*[:=]\s*["']?)[^"'\s,}]+/gi,
];

/**
 * Redacts sensitive tokens or secrets from serialized console arguments.
 * @param {Array<string>} args
 * @returns {Array<string>}
 */
export function sanitizeConsoleArgs(args = []) {
  if (!Array.isArray(args)) return [];

  return args.map((arg) => {
    if (typeof arg !== "string") return String(arg);

    let sanitized = sanitizeUrl(arg);

    for (const pattern of SENSITIVE_PATTERNS) {
      sanitized = sanitized.replace(pattern, "$1[REDACTED]");
    }

    return sanitized;
  });
}

export default sanitizeConsoleArgs;
