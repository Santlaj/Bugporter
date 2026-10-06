import { errorStore } from "../models/error-store";
import { breadcrumbStore } from "../models/breadcrumb-store";

let isListening = false;
let errorHandler = null;
let rejectionHandler = null;

export function initErrorCapture() {
  if (isListening || typeof window === "undefined") return;

  errorHandler = (event) => {
    try {
      const errorObj = {
        type: "uncaught_error",
        message: event.message || (event.error && event.error.message) || "Script error",
        filename: event.filename || "",
        lineno: event.lineno || 0,
        colno: event.colno || 0,
        stack: event.error && event.error.stack ? event.error.stack : "",
        timestamp: Date.now(),
      };

      errorStore.push(errorObj);
      breadcrumbStore.push({
        type: "console_error",
        message: `Uncaught error: ${errorObj.message}`,
        timestamp: errorObj.timestamp,
      });
    } catch {
      // Fail silently
    }
  };

  rejectionHandler = (event) => {
    try {
      const reason = event.reason;
      let message = "Unhandled Promise Rejection";
      let stack = "";

      if (typeof reason === "string") {
        message = reason;
      } else if (reason && typeof reason === "object") {
        message = reason.message || message;
        stack = reason.stack || "";
      }

      const errorObj = {
        type: "unhandled_rejection",
        message,
        stack,
        timestamp: Date.now(),
      };

      errorStore.push(errorObj);
      breadcrumbStore.push({
        type: "console_error",
        message: `Unhandled rejection: ${message}`,
        timestamp: errorObj.timestamp,
      });
    } catch {
      // Fail silently
    }
  };

  window.addEventListener("error", errorHandler);
  window.addEventListener("unhandledrejection", rejectionHandler);

  isListening = true;
}

export function teardownErrorCapture() {
  if (!isListening || typeof window === "undefined") return;

  if (errorHandler) window.removeEventListener("error", errorHandler);
  if (rejectionHandler) window.removeEventListener("unhandledrejection", rejectionHandler);

  isListening = false;
}

export default {
  init: initErrorCapture,
  teardown: teardownErrorCapture,
};
