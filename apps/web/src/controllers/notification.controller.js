import { notificationModel, integrationModel, reportModel } from "../models";
import { emailService } from "../services/email.service";
import { githubController } from "./github.controller";
import { telegramController } from "./telegram.controller";

export const notificationController = {
  async listNotifications(projectId, limit = 50) {
    return notificationModel.findByProjectId(projectId, limit);
  },

  async logNotification(projectId, reportId, channel, status, error = null) {
    return notificationModel.create({
      projectId,
      reportId,
      channel,
      status,
      error,
    });
  },

  /**
   * Dispatches email notification for a new bug report.
   */
  async sendEmailAlert(reportId, projectId) {
    const integration = await integrationModel.findByType(projectId, "EMAIL");
    if (!integration || !integration.enabled) return null;

    const { email } = integration.config || {};
    if (!email) return null;

    const report = await reportModel.findById(reportId);
    if (!report) return null;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const reportUrl = `${appUrl}/dashboard/reports/${report.id}`;

    const subject = `[${report.severity}] New Bug Report: ${report.title}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
        <h2 style="color: #4f46e5; margin-top: 0;">Bug Report Received</h2>
        <h3 style="margin-bottom: 8px;">${report.title}</h3>
        <p style="background: #f1f5f9; padding: 12px; border-radius: 8px; font-size: 14px;">${report.description}</p>
        <p style="font-size: 13px; color: #64748b;">
          <strong>Page:</strong> ${report.route}<br />
          <strong>Browser:</strong> ${report.browser} ${report.browserVersion} • ${report.os}<br />
          <strong>Severity:</strong> ${report.severity}
        </p>
        <a href="${reportUrl}" style="display: inline-block; padding: 10px 18px; background: #4f46e5; color: white; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 600; margin-top: 10px;">
          View in Dashboard →
        </a>
      </div>
    `;

    try {
      await emailService.sendEmail({ to: email, subject, html });
      await this.logNotification(projectId, reportId, "EMAIL", "SENT");
    } catch (err) {
      await this.logNotification(projectId, reportId, "EMAIL", "FAILED", err.message);
    }
  },

  /**
   * Dispatches all active project integrations in parallel with failure isolation.
   */
  async dispatchAll(reportId, projectId) {
    const results = await Promise.allSettled([
      githubController.createIssueForReport(reportId, projectId),
      telegramController.sendAlert(reportId, projectId),
      this.sendEmailAlert(reportId, projectId),
    ]);

    return results;
  },
};

export default notificationController;
