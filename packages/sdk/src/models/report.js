import { breadcrumbStore } from "./breadcrumb-store";
import { consoleStore } from "./console-store";
import { networkStore } from "./network-store";
import { errorStore } from "./error-store";
import { environmentModel } from "./environment";
import { elementSelectionModel } from "./element-selection";

/**
 * Report Assembler Model.
 * Consolidates all buffered diagnostics and user input into the canonical submission payload.
 */
export const reportAssemblerModel = {
  /**
   * Assembles the complete report payload.
   * @param {object} params
   * @param {string} params.apiKey
   * @param {string} params.description
   * @param {string} [params.title]
   * @param {string} [params.honeypot]
   * @param {object} [params.metadata]
   */
  assemble({ apiKey, description, title, honeypot = "", metadata = {} } = {}) {
    const environment = environmentModel.collect();
    const breadcrumbs = breadcrumbStore.getAll();
    const consoleEvents = consoleStore.getAll();
    const networkEvents = networkStore.getAll();
    const errorEvents = errorStore.getAll();
    const element = elementSelectionModel.get();

    return {
      apiKey,
      description: (description || "").trim(),
      title: title || (description ? description.trim().slice(0, 80) : "Bug Report"),
      environment,
      element,
      breadcrumbs,
      consoleEvents,
      networkEvents,
      errorEvents,
      metadata: metadata || {},
      honeypot: honeypot || "",
      timestamp: Date.now(),
    };
  },
};

export default reportAssemblerModel;
