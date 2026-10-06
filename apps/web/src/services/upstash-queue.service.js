import { Client } from "@upstash/qstash";

let qstashClient = null;

if (process.env.QSTASH_TOKEN) {
  try {
    qstashClient = new Client({
      token: process.env.QSTASH_TOKEN,
    });
  } catch (err) {
    console.warn("[UpstashQueue] Failed to initialize QStash client:", err.message);
  }
}

export const queueService = {
  /**
   * Enqueues an asynchronous notification job to QStash.
   * Fails silently so report ingestion is never blocked.
   * @param {string} destinationUrl
   * @param {object} payload
   * @param {object} [options]
   */
  async enqueue(destinationUrl, payload, options = {}) {
    if (!destinationUrl) return null;

    if (!qstashClient) {
      if (process.env.NODE_ENV === "development") {
        console.info(`[QueueService (Dev)] Job queued for ${destinationUrl}:`, payload);
      }
      return { messageId: "dev_mock_job_id" };
    }

    try {
      const res = await qstashClient.publishJSON({
        url: destinationUrl,
        body: payload,
        retries: options.retries || 3,
        delay: options.delay || 0,
      });

      return res;
    } catch (err) {
      console.warn("[QueueService] Failed to enqueue QStash job:", err.message);
      return null;
    }
  },

  /**
   * Dispatches outbound notification jobs for a newly created report.
   * @param {string} reportId
   * @param {string} projectId
   */
  async dispatchReportCreatedJobs(reportId, projectId) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const workerEndpoint = `${appUrl}/api/v1/jobs/notifications`;

    return this.enqueue(workerEndpoint, {
      reportId,
      projectId,
      timestamp: Date.now(),
    });
  },
};

export default queueService;
