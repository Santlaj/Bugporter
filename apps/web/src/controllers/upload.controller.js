import { generateUploadSignature } from "../services/cloudinary.service";
import { reportModel, reportScreenshotModel } from "../models";
import { NotFoundError, ValidationError } from "../lib/errors";

export const uploadController = {
  /**
   * Generates signed Cloudinary upload parameters for a report screenshot.
   */
  async generateSignature(reportId) {
    const report = await reportModel.findById(reportId);
    if (!report) {
      throw new NotFoundError("Report not found");
    }

    return generateUploadSignature(report.projectId, reportId);
  },

  /**
   * Completes a screenshot upload and persists its metadata.
   */
  async completeUpload(reportId, screenshotData) {
    const report = await reportModel.findById(reportId);
    if (!report) {
      throw new NotFoundError("Report not found");
    }

    return reportScreenshotModel.upsert(reportId, {
      publicId: screenshotData.publicId,
      url: screenshotData.url,
      format: screenshotData.format || "webp",
      width: screenshotData.width,
      height: screenshotData.height,
      bytes: screenshotData.bytes,
    });
  },
};

export default uploadController;
