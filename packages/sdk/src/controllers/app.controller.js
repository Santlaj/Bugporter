import { captureController } from "./capture.controller";
import { widgetController } from "./widget.controller";

let sdkConfig = {
  apiKey: "",
  endpoint: "/api/v1",
  autoMount: true,
};

let isBooted = false;

export const appController = {
  /**
   * Reads data-key from the active script tag if available.
   */
  readScriptConfig() {
    if (typeof document === "undefined") return {};

    try {
      const script =
        document.currentScript ||
        document.querySelector("script[data-key]");

      if (!script) return {};

      return {
        apiKey: script.getAttribute("data-key") || "",
        endpoint: script.getAttribute("data-endpoint") || "/api/v1",
      };
    } catch {
      return {};
    }
  },

  /**
   * Initializes the application lifecycle.
   * Stores config, starts capture controllers, mounts widget UI, and handles graceful failure.
   */
  init(options = {}) {
    if (isBooted) return sdkConfig;

    try {
      const scriptConfig = this.readScriptConfig();

      sdkConfig = {
        ...sdkConfig,
        ...scriptConfig,
        ...options,
      };

      // 1. Boot capture layer (diagnostics in memory)
      captureController.init();

      // 2. Mount widget UI inside Shadow DOM if autoMount is enabled
      if (sdkConfig.autoMount !== false) {
        widgetController.init({
          apiKey: sdkConfig.apiKey,
          endpoint: sdkConfig.endpoint,
        });
      }

      isBooted = true;
    } catch {
      // Fail silently without interrupting host application
    }

    return sdkConfig;
  },

  getConfig() {
    return { ...sdkConfig };
  },

  isInitialized() {
    return isBooted;
  },
};

export default appController;
