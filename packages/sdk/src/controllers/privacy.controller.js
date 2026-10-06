import { sanitizeUrl } from "../privacy/sanitize-url";
import { sanitizeConsoleArgs } from "../privacy/sanitize-console";
import { sanitizeNetworkEvent } from "../privacy/sanitize-network";
import { maskDomTree } from "../privacy/mask-dom";

export const privacyController = {
  /**
   * Masks a cloned DOM element tree before screenshot capture.
   */
  maskClone(clonedElement) {
    return maskDomTree(clonedElement);
  },

  /**
   * Sanitizes all telemetry collections before payload assembly or submission.
   */
  sanitizeTelemetry({ breadcrumbs = [], consoleEvents = [], networkEvents = [], environment = {} } = {}) {
    const sanitizedBreadcrumbs = breadcrumbs.map((b) => ({
      ...b,
      message: sanitizeUrl(b.message),
      data: b.data ? JSON.parse(JSON.stringify(b.data)) : undefined,
    }));

    const sanitizedConsole = consoleEvents.map((c) => ({
      ...c,
      args: sanitizeConsoleArgs(c.args),
    }));

    const sanitizedNetwork = networkEvents.map((n) => sanitizeNetworkEvent(n));

    const sanitizedEnvironment = {
      ...environment,
      url: sanitizeUrl(environment.url),
      route: sanitizeUrl(environment.route),
      referrer: sanitizeUrl(environment.referrer),
    };

    return {
      breadcrumbs: sanitizedBreadcrumbs,
      consoleEvents: sanitizedConsole,
      networkEvents: sanitizedNetwork,
      environment: sanitizedEnvironment,
    };
  },
};

export default privacyController;
