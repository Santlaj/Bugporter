import { reportSubmitSchema } from "../lib/validation";
import { redactUrl, sanitizeText } from "../lib/sanitize";
import { LIMITS } from "../lib/constants";
import { reportModel, reportEventModel, projectApiKeyModel } from "../models";
import { originController } from "./origin.controller";
import { rateLimitService } from "../services/upstash-rate-limit.service";
import { generateFingerprint } from "../services/fingerprint.service";
import { queueService } from "../services/upstash-queue.service";
import { ValidationError, ForbiddenError } from "../lib/errors";

export const ingestionController = {
  /**
   * High-performance report ingestion path:
   * 1. Validate payload with Zod
   * 2. Reject honeypot spam
   * 3. Validate Public API Key
   * 4. Verify Request Origin against allowlist
   * 5. Check IP and Project rate limits
   * 6. Enforce server-side bounds
   * 7. Sanitize strings & redact sensitive URL parameters
   * 8. Generate SHA-256 fingerprint for deduplication
   * 9. Persist Report & Diagnostic Events in PostgreSQL
   * 10. Dispatch asynchronous background notifications to QStash
   * 11. Respond immediately with report ID
   *
   * @param {object} rawPayload
   * @param {string} origin
   * @param {string} ip
   * @returns {Promise<{ reportId: string, projectId: string, fingerprint: string }>}
   */
  async createReport(rawPayload, origin, ip = "unknown") {
    // 1. Validate payload structure
    const parseResult = reportSubmitSchema.safeParse(rawPayload);
    if (!parseResult.success) {
      throw new ValidationError("Invalid bug report payload", parseResult.error.format());
    }

    const data = parseResult.data;

    // 2. Honeypot check
    if (data.honeypot && data.honeypot.trim().length > 0) {
      throw new ValidationError("Automated bot submission rejected.");
    }

    // 3. Validate API key
    const apiKeyRecord = await projectApiKeyModel.findByPublicKey(data.apiKey);
    if (!apiKeyRecord || apiKeyRecord.status !== "ACTIVE") {
      throw new ForbiddenError("Invalid or revoked project API key.");
    }

    const project = apiKeyRecord.project;

    // 4. Validate request origin
    await originController.validateOrigin(project.id, origin);

    // 5. Rate limiting
    await rateLimitService.checkRateLimits(ip, project.id);

    // 6. Enforce server-side size limits
    const sanitizedDescription = sanitizeText(data.description, LIMITS.MAX_DESCRIPTION_BYTES);
    const sanitizedUrl = redactUrl(data.environment.url);
    const sanitizedRoute = redactUrl(data.environment.route);

    // Extract top stack frame if errors were present
    let topStack = "";
    if (Array.isArray(data.consoleEvents)) {
      const errEvent = data.consoleEvents.find((c) => c.level === "error" && c.stack);
      if (errEvent) topStack = errEvent.stack;
    }

    // 7. Generate duplicate fingerprint (SHA-256)
    const fingerprint = generateFingerprint({
      message: sanitizedDescription,
      route: sanitizedRoute,
      stack: topStack,
    });

    // 8. Create Report record
    const title = data.title
      ? sanitizeText(data.title, 120)
      : sanitizedDescription.slice(0, 80) + (sanitizedDescription.length > 80 ? "..." : "");

    const report = await reportModel.create({
      projectId: project.id,
      fingerprint,
      title,
      description: sanitizedDescription,
      url: sanitizedUrl,
      route: sanitizedRoute,
      browser: data.environment.browser,
      browserVersion: data.environment.browserVersion,
      os: data.environment.os,
      viewportWidth: data.environment.viewportWidth,
      viewportHeight: data.environment.viewportHeight,
      devicePixelRatio: data.environment.devicePixelRatio,
      userAgent: data.environment.userAgent || null,
      language: data.environment.language || null,
      timezone: data.environment.timezone || null,
      referrer: data.environment.referrer ? redactUrl(data.environment.referrer) : null,
      elementTag: data.element?.tag || null,
      elementSelector: data.element?.selector || null,
      elementText: data.element?.text || null,
      elementRect: data.element?.rect || null,
      metadata: data.metadata || null,
    });

    // 9. Bulk persist telemetry events
    const events = [];

    const boundedBreadcrumbs = (data.breadcrumbs || []).slice(-LIMITS.MAX_BREADCRUMBS);
    boundedBreadcrumbs.forEach((b) => {
      events.push({
        type: "breadcrumb",
        payload: {
          ...b,
          message: redactUrl(b.message),
        },
        timestamp: b.timestamp ? new Date(b.timestamp) : new Date(),
      });
    });

    const boundedConsole = (data.consoleEvents || []).slice(-LIMITS.MAX_CONSOLE_EVENTS);
    boundedConsole.forEach((c) => {
      events.push({
        type: "console",
        payload: c,
        timestamp: c.timestamp ? new Date(c.timestamp) : new Date(),
      });
    });

    const boundedNetwork = (data.networkEvents || []).slice(-LIMITS.MAX_NETWORK_EVENTS);
    boundedNetwork.forEach((n) => {
      events.push({
        type: "network",
        payload: {
          ...n,
          url: redactUrl(n.url),
        },
        timestamp: n.timestamp ? new Date(n.timestamp) : new Date(),
      });
    });

    if (events.length > 0) {
      await reportEventModel.bulkCreate(report.id, events);
    }

    // 10. Asynchronously queue outbound notifications (non-blocking)
    queueService.dispatchReportCreatedJobs(report.id, project.id).catch((err) => {
      console.warn("[Ingestion] Background job dispatch failed:", err.message);
    });

    // 11. Return fast
    return {
      reportId: report.id,
      projectId: project.id,
      fingerprint,
    };
  },
};

export default ingestionController;
