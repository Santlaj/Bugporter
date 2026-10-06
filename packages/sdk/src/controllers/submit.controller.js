import { reportAssemblerModel } from "../models/report";
import { privacyController } from "./privacy.controller";
import { captureScreenshot } from "../capture/screenshot.capture";
import { apiTransport } from "../transport/api";
import { uploadScreenshotDirect } from "../transport/upload";

export const submitController = {
  /**
   * Orchestrates the complete submission pipeline:
   * 1. Honeypot check
   * 2. Assemble report payload from models
   * 3. Sanitize telemetry via privacy controller
   * 4. Capture masked screenshot (graceful fallback if fails)
   * 5. Post report metadata to ingestion API
   * 6. If screenshot exists: sign -> upload to Cloudinary -> mark complete
   * @param {object} params
   * @param {string} params.apiKey
   * @param {string} [params.endpoint]
   * @param {string} params.description
   * @param {string} [params.honeypot]
   * @param {function} [params.onProgress]
   */
  async submit({ apiKey, endpoint = "/api/v1", description, honeypot = "", onProgress } = {}) {
    // 1. Honeypot check
    if (honeypot && honeypot.trim().length > 0) {
      return { reportId: "rep_honeypot_dropped", status: "success" };
    }

    if (onProgress) onProgress("Capturing diagnostics...");

    // 2. Assemble canonical report payload
    const rawPayload = reportAssemblerModel.assemble({
      apiKey,
      description,
      honeypot,
    });

    // 3. Sanitize all telemetry before transmission
    const sanitizedTelemetry = privacyController.sanitizeTelemetry({
      breadcrumbs: rawPayload.breadcrumbs,
      consoleEvents: rawPayload.consoleEvents,
      networkEvents: rawPayload.networkEvents,
      environment: rawPayload.environment,
    });

    const payload = {
      ...rawPayload,
      breadcrumbs: sanitizedTelemetry.breadcrumbs,
      consoleEvents: sanitizedTelemetry.consoleEvents,
      networkEvents: sanitizedTelemetry.networkEvents,
      environment: sanitizedTelemetry.environment,
    };

    // 4. Capture screenshot with full failure isolation
    let screenshotData = null;
    try {
      if (onProgress) onProgress("Capturing viewport screenshot...");
      screenshotData = await captureScreenshot();
    } catch (screenshotErr) {
      if (typeof console !== "undefined" && console.warn) {
        console.warn("[BugReporter] Screenshot capture failed gracefully:", screenshotErr.message);
      }
    }

    // 5. Transmit core report to backend
    if (onProgress) onProgress("Submitting bug report...");
    const result = await apiTransport.submitReport(endpoint, payload);
    const reportId = result.reportId;

    // 6. Handle asynchronous Cloudinary screenshot upload if screenshot succeeded
    if (screenshotData && screenshotData.blob && reportId) {
      try {
        if (onProgress) onProgress("Uploading screenshot...");

        // Request upload signature from backend
        const signatureData = await apiTransport.getUploadSignature(endpoint, reportId);

        // Upload directly to Cloudinary
        const uploadResult = await uploadScreenshotDirect(screenshotData.blob, signatureData);

        // Notify backend of completion
        await apiTransport.completeScreenshotUpload(endpoint, reportId, uploadResult);
      } catch (uploadErr) {
        // Screenshot upload failure MUST NOT fail the bug report submission
        if (typeof console !== "undefined" && console.warn) {
          console.warn("[BugReporter] Screenshot upload failed gracefully:", uploadErr.message);
        }
      }
    }

    return {
      reportId: reportId || "rep_submitted",
      status: "success",
    };
  },
};

export default submitController;
