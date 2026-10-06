import { networkStore } from "../models/network-store";
import { breadcrumbStore } from "../models/breadcrumb-store";
import { consoleStore } from "../models/console-store";

let isInstrumented = false;
let originalFetch = null;

export function initFetchCapture() {
  if (isInstrumented || typeof window === "undefined" || !window.fetch) return;

  originalFetch = window.fetch;

  window.fetch = function (...args) {
    const startTime = Date.now();
    let url = "";
    let method = "GET";

    try {
      if (typeof args[0] === "string") {
        url = args[0];
      } else if (args[0] && typeof args[0] === "object") {
        url = args[0].url || String(args[0]);
        if (args[0].method) {
          method = args[0].method.toUpperCase();
        }
      }

      if (args[1] && args[1].method) {
        method = args[1].method.toUpperCase();
      }
    } catch {
      // Ignore URL extraction error
    }

    return originalFetch
      .apply(this, args)
      .then((response) => {
        try {
          const duration = Date.now() - startTime;
          const status = response ? response.status : 0;

          networkStore.push({
            type: "fetch",
            method,
            url,
            status,
            duration,
            timestamp: startTime,
          });

          if (status >= 400) {
            breadcrumbStore.push({
              type: "network_error",
              message: `${method} ${url} failed with status ${status}`,
              timestamp: Date.now(),
              data: { status, duration },
            });

            consoleStore.push({
              level: "error",
              args: [`Failed to load resource: the server responded with a status of ${status} (${method} ${url})`],
              timestamp: Date.now(),
            });
          }
        } catch {
          // Fail silently
        }

        return response;
      })
      .catch((error) => {
        try {
          const duration = Date.now() - startTime;
          networkStore.push({
            type: "fetch",
            method,
            url,
            status: 0,
            duration,
            error: error ? error.message : "Network request failed",
            timestamp: startTime,
          });

          breadcrumbStore.push({
            type: "network_error",
            message: `${method} ${url} network failure`,
            timestamp: Date.now(),
            data: { error: error ? error.message : "Network error" },
          });

          consoleStore.push({
            level: "error",
            args: [`NetworkError: ${error ? error.message : "Request failed"} (${method} ${url})`],
            timestamp: Date.now(),
          });
        } catch {
          // Fail silently
        }

        throw error;
      });
  };

  isInstrumented = true;
}

export function teardownFetchCapture() {
  if (!isInstrumented || typeof window === "undefined" || !window.fetch) return;

  if (originalFetch) {
    window.fetch = originalFetch;
  }
  isInstrumented = false;
}

export default {
  init: initFetchCapture,
  teardown: teardownFetchCapture,
};
