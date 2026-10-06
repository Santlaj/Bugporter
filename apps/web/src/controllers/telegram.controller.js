import { integrationModel, reportModel, reportEventModel, notificationModel } from "../models";
import { telegramService } from "../services/telegram.service";
import { NotFoundError } from "../lib/errors";

export const telegramController = {
  async getIntegration(projectId) {
    return integrationModel.findByType(projectId, "TELEGRAM");
  },

  async configureTelegram(projectId, { chatId, botToken, topicId }) {
    return integrationModel.upsert(projectId, "TELEGRAM", {
      chatId,
      botToken,
      topicId: topicId || null,
    });
  },

  async disableTelegram(projectId) {
    return integrationModel.delete(projectId, "TELEGRAM");
  },

  /**
   * Dispatches a concise Telegram alert for a new bug report.
   * @param {string} reportId
   * @param {string} projectId
   */
  async sendAlert(reportId, projectId) {
    const integration = await integrationModel.findByType(projectId, "TELEGRAM");
    if (!integration || !integration.enabled) return null;

    const { botToken, chatId, topicId } = integration.config || {};
    if (!botToken || !chatId) return null;

    const report = await reportModel.findById(reportId);
    if (!report) throw new NotFoundError("Report not found");

    const events = await reportEventModel.findByReportId(reportId);
    const consoleError = events.find((e) => e.type === "console" && e.payload?.level === "error");

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const reportUrl = `${appUrl}/dashboard/reports/${report.id}`;

    const text = `🚨 <b>New Bug Report [${report.severity}]</b>
<b>${report.title}</b>

<b>Page:</b> <code>${report.route}</code>
<b>Client:</b> ${report.browser} • ${report.os}
${consoleError ? `<b>Console Error:</b> <code>${(consoleError.payload?.args || []).slice(0, 1).join(" ")}</code>\n` : ""}
<a href="${reportUrl}">View Report in Dashboard →</a>`;

    try {
      const result = await telegramService.sendMessage({
        botToken,
        chatId,
        text,
        topicId,
      });

      await notificationModel.create({
        projectId,
        reportId,
        channel: "TELEGRAM",
        status: "SENT",
      });

      return result;
    } catch (err) {
      await notificationModel.create({
        projectId,
        reportId,
        channel: "TELEGRAM",
        status: "FAILED",
        error: err.message,
      });
      throw err;
    }
  },
};

export default telegramController;
