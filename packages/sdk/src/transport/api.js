import { withRetry } from "./retry";

function normalizeEndpoint(endpoint) {
  return endpoint.replace(/\/+$/, "");
}

export const apiTransport = {
  /**
   * Submits a bug report payload to the backend ingestion route.
   */
  async submitReport(endpoint, payload) {
    const base = normalizeEndpoint(endpoint);
    const url = base.endsWith("/reports") ? base : `${base}/reports`;

    return withRetry(
      async () => {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          let errText = `API error ${res.status}`;
          try {
            const data = await res.json();
            if (data && data.error) errText = data.error;
          } catch {}
          throw new Error(errText);
        }

        return res.json();
      },
      { retries: 1 }
    );
  },

  /**
   * Requests signed Cloudinary upload credentials from backend.
   */
  async getUploadSignature(endpoint, reportId) {
    const base = normalizeEndpoint(endpoint);
    const url = `${base}/reports/${reportId}/upload-signature`;

    return withRetry(async () => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error(`Failed to obtain upload signature: ${res.status}`);
      }

      return res.json();
    });
  },

  /**
   * Notifies backend that screenshot has completed uploading.
   */
  async completeScreenshotUpload(endpoint, reportId, screenshotMetadata) {
    const base = normalizeEndpoint(endpoint);
    const url = `${base}/reports/${reportId}/complete`;

    return withRetry(async () => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(screenshotMetadata),
      });

      if (!res.ok) {
        throw new Error(`Failed to complete screenshot upload: ${res.status}`);
      }

      return res.json();
    });
  },
};

export default apiTransport;
