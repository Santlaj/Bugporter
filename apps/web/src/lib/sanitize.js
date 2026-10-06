const SENSITIVE_QUERY_PARAMS = new Set([
  "token",
  "access_token",
  "refresh_token",
  "jwt",
  "secret",
  "password",
  "api_key",
  "apikey",
  "signature",
  "code",
  "auth",
  "key",
]);

/**
 * Redacts sensitive query parameter values from URLs.
 * @param {string} urlString
 * @returns {string}
 */
export function redactUrl(urlString) {
  if (!urlString || typeof urlString !== "string") return urlString;

  try {
    const url = new URL(urlString);
    let mutated = false;

    for (const key of url.searchParams.keys()) {
      if (SENSITIVE_QUERY_PARAMS.has(key.toLowerCase())) {
        url.searchParams.set(key, "[REDACTED]");
        mutated = true;
      }
    }

    return mutated ? url.toString() : urlString;
  } catch {
    // If not a full URL (e.g. relative path), handle query string manually
    return urlString.replace(
      /([?&])(token|access_token|refresh_token|jwt|secret|password|api_key|apikey|signature|code|auth|key)=([^&#]*)/gi,
      "$1$2=[REDACTED]"
    );
  }
}

/**
 * Sanitizes plain text input by trimming and capping max length.
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export function sanitizeText(str, maxLength = 5120) {
  if (!str || typeof str !== "string") return "";
  return str.trim().slice(0, maxLength);
}
