import { initConsoleCapture, teardownConsoleCapture } from "../capture/console.capture";
import { initErrorCapture, teardownErrorCapture } from "../capture/errors.capture";
import { initFetchCapture, teardownFetchCapture } from "../capture/fetch.capture";
import { initXhrCapture, teardownXhrCapture } from "../capture/xhr.capture";
import { initClickCapture, teardownClickCapture } from "../capture/clicks.capture";
import { initNavigationCapture, teardownNavigationCapture } from "../capture/navigation.capture";

let isCapturing = false;

export const captureController = {
  /**
   * Initializes all instrumentation modules with total failure isolation.
   * If any module fails, other modules continue uninterrupted.
   */
  init() {
    if (isCapturing) return;

    try {
      initConsoleCapture();
    } catch (err) {
      // Fail silently
    }

    try {
      initErrorCapture();
    } catch (err) {
      // Fail silently
    }

    try {
      initFetchCapture();
    } catch (err) {
      // Fail silently
    }

    try {
      initXhrCapture();
    } catch (err) {
      // Fail silently
    }

    try {
      initClickCapture();
    } catch (err) {
      // Fail silently
    }

    try {
      initNavigationCapture();
    } catch (err) {
      // Fail silently
    }

    isCapturing = true;
  },

  /**
   * Stops all instrumentation and restores browser native prototypes.
   */
  teardown() {
    if (!isCapturing) return;

    try { teardownConsoleCapture(); } catch {}
    try { teardownErrorCapture(); } catch {}
    try { teardownFetchCapture(); } catch {}
    try { teardownXhrCapture(); } catch {}
    try { teardownClickCapture(); } catch {}
    try { teardownNavigationCapture(); } catch {}

    isCapturing = false;
  },

  isCapturing() {
    return isCapturing;
  },
};

export default captureController;
