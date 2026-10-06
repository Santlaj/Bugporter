import { networkStore } from "../models/network-store";
import { breadcrumbStore } from "../models/breadcrumb-store";
import { consoleStore } from "../models/console-store";

let isInstrumented = false;
let originalOpen = null;
let originalSend = null;

export function initXhrCapture() {
  if (isInstrumented || typeof window === "undefined" || !window.XMLHttpRequest) return;

  originalOpen = XMLHttpRequest.prototype.open;
  originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    try {
      this._bugReporterMeta = {
        method: typeof method === "string" ? method.toUpperCase() : "GET",
        url: typeof url === "string" ? url : String(url),
      };
    } catch {
      // Fail silently
    }
    return originalOpen.call(this, method, url, ...rest);
  };

  XMLHttpRequest.prototype.send = function (...args) {
    try {
      if (this._bugReporterMeta) {
        const meta = this._bugReporterMeta;
        const startTime = Date.now();

        const onComplete = () => {
          try {
            const duration = Date.now() - startTime;
            const status = this.status || 0;

            networkStore.push({
              type: "xhr",
              method: meta.method,
              url: meta.url,
              status,
              duration,
              timestamp: startTime,
            });

            if (status >= 400 || status === 0) {
              breadcrumbStore.push({
                type: "network_error",
                message: `XHR ${meta.method} ${meta.url} ${status === 0 ? "failed" : `status ${status}`}`,
                timestamp: Date.now(),
                data: { status, duration },
              });

              consoleStore.push({
                level: "error",
                args: [`Failed to load resource: the server responded with a status of ${status} (${meta.method} ${meta.url})`],
                timestamp: Date.now(),
              });
            }
          } catch {
            // Fail silently
          }
        };

        this.addEventListener("loadend", onComplete, { once: true });
      }
    } catch {
      // Fail silently
    }

    return originalSend.apply(this, args);
  };

  isInstrumented = true;
}

export function teardownXhrCapture() {
  if (!isInstrumented || typeof window === "undefined" || !window.XMLHttpRequest) return;

  if (originalOpen) XMLHttpRequest.prototype.open = originalOpen;
  if (originalSend) XMLHttpRequest.prototype.send = originalSend;

  isInstrumented = false;
}

export default {
  init: initXhrCapture,
  teardown: teardownXhrCapture,
};
