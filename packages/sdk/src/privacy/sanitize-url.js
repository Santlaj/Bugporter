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
 * Redacts sensitive tokens and credentials from URL strings in the browser.
 * @param {string} urlString
 * @returns {string}
 */
export function sanitizeUrl(urlString) {
  if (!urlString || typeof urlString !== "string") return urlString;

  try {
    const url = new URL(urlString, typeof window !== "undefined" ? window.location.origin : "http://localhost");
    let modified = false;

    for (const key of url.searchParams.keys()) {
      if (SENSITIVE_QUERY_PARAMS.has(key.toLowerCase())) {
        url.searchParams.set(key, "[REDACTED]");
        modified = true;
      }
    }

    return modified ? url.toString() : urlString;
  } catch {
    // If not a parseable URL, use regex fallback
    return urlString.replace(
      /([?&])(token|access_token|refresh_token|jwt|secret|password|api_key|apikey|signature|code|auth|key)=([^&#]*)/gi,
      "$1$2=[REDACTED]"
    );
  }
}

export default sanitizeUrl;
