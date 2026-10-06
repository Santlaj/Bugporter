import { reportModel, reportEventModel, reportScreenshotModel } from "../models";
import { cloudinaryService } from "../services";
import { REPORT_STATUS, REPORT_SEVERITY } from "../lib/constants";
import { NotFoundError, ValidationError } from "../lib/errors";

export const reportController = {
  /**
   * Retrieves full report detail for dashboard investigation.
   */
  async getReportDetail(reportId) {
    const report = await reportModel.findById(reportId);
    if (!report) {
      throw new NotFoundError("Bug report not found");
    }

    const [events, screenshot] = await Promise.all([
      reportEventModel.findByReportId(reportId),
      reportScreenshotModel.findByReportId(reportId),
    ]);

    // Partition events into categories
    const breadcrumbs = [];
    const consoleEvents = [];
    const networkEvents = [];

    events.forEach((ev) => {
      const item = {
        ...ev,
        payload: ev.payload || {},
      };
      if (ev.type === "breadcrumb") breadcrumbs.push(item);
      else if (ev.type === "console") consoleEvents.push(item);
      else if (ev.type === "network") networkEvents.push(item);
    });

    // Build optimized Cloudinary URLs
    let screenshotUrls = null;
    if (screenshot?.publicId) {
      screenshotUrls = {
        thumbnail: cloudinaryService.buildImageUrl(screenshot.publicId, { width: 400 }),
        detail: cloudinaryService.buildImageUrl(screenshot.publicId, { width: 1000 }),
        original: screenshot.url,
      };
    }

    return {
      ...report,
      screenshot: screenshot
        ? {
            ...screenshot,
            urls: screenshotUrls,
          }
        : null,
      breadcrumbs,
      consoleEvents,
      networkEvents,
    };
  },

  /**
   * Lists reports for a project with optional status, severity, and search filters.
   */
  async listReports(projectId, filters = {}) {
    return reportModel.findManyByProjectId(projectId, filters);
  },

  /**
   * Updates report resolution status (OPEN, IN_PROGRESS, RESOLVED, IGNORED, DUPLICATE).
   */
  async updateStatus(reportId, status) {
    if (!Object.values(REPORT_STATUS).includes(status)) {
      throw new ValidationError(`Invalid report status: ${status}`);
    }
    return reportModel.updateStatus(reportId, status);
  },

  /**
   * Updates report severity level (P0, P1, P2, P3).
   */
  async updateSeverity(reportId, severity) {
    if (!Object.values(REPORT_SEVERITY).includes(severity)) {
      throw new ValidationError(`Invalid report severity: ${severity}`);
    }
    return reportModel.updateSeverity(reportId, severity);
  },
};

export default reportController;
