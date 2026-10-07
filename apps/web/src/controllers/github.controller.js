import { githubInstallationModel, reportModel, reportEventModel, reportScreenshotModel } from "../models";
import { githubService } from "../services/github.service";
import { notificationModel } from "../models/notification.model";
import { NotFoundError } from "../lib/errors";

function formatIssueMarkdown(report, events = [], screenshot = null) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const reportUrl = `${appUrl}/dashboard/reports/${report.id}`;

  const breadcrumbs = events.filter((e) => e.type === "breadcrumb");
  const consoleErrors = events.filter((e) => e.type === "console" && e.payload?.level === "error");
  const networkErrors = events.filter(
    (e) => e.type === "network" && (e.payload?.status >= 400 || e.payload?.status === 0)
  );

  let recentActivity = "No user actions recorded.";
  if (breadcrumbs.length > 0) {
    recentActivity = breadcrumbs
      .slice(-8)
      .map((b, i) => `${i + 1}. ${b.payload?.message || "Action"}`)
      .join("\n");
  }

  let consoleSection = "None";
  if (consoleErrors.length > 0) {
    consoleSection = consoleErrors
      .slice(-3)
      .map((c) => `\`\`\`\n${(c.payload?.args || []).join(" ")}\n\`\`\``)
      .join("\n\n");
  }

  let networkSection = "None";
  if (networkErrors.length > 0) {
    networkSection = networkErrors
      .slice(-3)
      .map((n) => `${n.payload?.method || "GET"} ${n.payload?.url || ""} → Status: ${n.payload?.status || 0} (${n.payload?.duration || 0}ms)`)
      .join("\n");
  }

  let screenshotSection = "No screenshot captured.";
  if (screenshot?.url) {
    screenshotSection = `![Screenshot](${screenshot.url})\n\n[View Full Image](${screenshot.url})`;
  }

  return `## ${report.title}

### User Report
${report.description}

### Page & Target
- **URL:** ${report.url}
- **Route:** \`${report.route}\`
${report.elementSelector ? `- **Target Element:** \`<${report.elementTag || "element"}>\` \`${report.elementSelector}\`` : ""}

### Environment
- **Browser:** ${report.browser} ${report.browserVersion}
- **OS:** ${report.os}
- **Viewport:** ${report.viewportWidth} × ${report.viewportHeight}
- **Device Pixel Ratio:** ${report.devicePixelRatio}x

### Recent Activity
${recentActivity}

### Console Errors
${consoleSection}

### Network Failures
${networkSection}

### Screenshot
${screenshotSection}

---
*Reported through Bug Porter*  
**Report ID:** \`${report.id}\` • [View in Dashboard](${reportUrl})
`;
}

export const githubController = {
  async getInstallation(projectId) {
    return githubInstallationModel.findByProjectId(projectId);
  },

  async saveInstallation(projectId, installationId, accountLogin, targetRepo) {
    return githubInstallationModel.upsert(projectId, {
      installationId,
      accountLogin,
      targetRepo,
    });
  },

  async removeInstallation(projectId) {
    return githubInstallationModel.delete(projectId);
  },

  /**
   * Creates a GitHub issue from a bug report.
   * @param {string} reportId
   * @param {string} projectId
   */
  async createIssueForReport(reportId, projectId) {
    const installation = await githubInstallationModel.findByProjectId(projectId);
    if (!installation || !installation.targetRepo) {
      return null; // GitHub App not configured or no target repo set
    }

    const report = await reportModel.findById(reportId);
    if (!report) throw new NotFoundError("Report not found");

    const [events, screenshot] = await Promise.all([
      reportEventModel.findByReportId(reportId),
      reportScreenshotModel.findByReportId(reportId),
    ]);

    const [owner, repo] = installation.targetRepo.split("/");
    const body = formatIssueMarkdown(report, events, screenshot);

    try {
      const issue = await githubService.createIssue({
        installationId: installation.installationId,
        owner,
        repo,
        title: report.title,
        body,
        labels: ["bug", `severity:${report.severity.toLowerCase()}`],
      });

      await notificationModel.create({
        projectId,
        reportId,
        channel: "GITHUB",
        status: "SENT",
      });

      return issue;
    } catch (err) {
      await notificationModel.create({
        projectId,
        reportId,
        channel: "GITHUB",
        status: "FAILED",
        error: err.message,
      });
      throw err;
    }
  },
};

export default githubController;
