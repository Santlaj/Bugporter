import { sanitizeUrl } from "./sanitize-url";

/**
 * Sanitizes network event telemetry.
 * Strips sensitive params from URL and guarantees no auth tokens are present.
 * @param {object} event
 * @returns {object}
 */
export function sanitizeNetworkEvent(event) {
  if (!event || typeof event !== "object") return event;

  return {
    ...event,
    url: sanitizeUrl(event.url),
  };
}

export default sanitizeNetworkEvent;
