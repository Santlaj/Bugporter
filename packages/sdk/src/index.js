import { appController } from "./controllers/app.controller";
import { widgetController } from "./controllers/widget.controller";
import {
  breadcrumbStore,
  consoleStore,
  networkStore,
  errorStore,
  environmentModel,
  elementSelectionModel,
  reportAssemblerModel,
} from "./models";

/**
 * Initializes the Bug Reporter SDK.
 * @param {object} options
 * @param {string} options.apiKey
 * @param {string} [options.endpoint]
 * @param {boolean} [options.autoMount]
 */
export function init(options = {}) {
  return appController.init(options);
}

// Auto-initialize if script has data-key
if (typeof window !== "undefined" && typeof document !== "undefined") {
  const currentScript =
    document.currentScript ||
    document.querySelector("script[data-key]");

  if (currentScript) {
    const apiKey = currentScript.getAttribute("data-key");
    if (apiKey) {
      init({ apiKey });
    }
  }
}

// Expose models & controllers for inspection/testing
export {
  breadcrumbStore,
  consoleStore,
  networkStore,
  errorStore,
  environmentModel,
  elementSelectionModel,
  reportAssemblerModel,
  widgetController,
  appController,
};

export default {
  init,
  breadcrumbStore,
  consoleStore,
  networkStore,
  errorStore,
  environmentModel,
  elementSelectionModel,
  reportAssemblerModel,
  widgetController,
  appController,
};
