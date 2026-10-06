import { withRetry } from "./retry";

/**
 * Uploads screenshot blob directly to Cloudinary using signed parameters.
 * SDK NEVER contains the Cloudinary API secret.
 * @param {Blob} blob
 * @param {object} signedParams
 * @param {string} signedParams.apiKey
 * @param {number} signedParams.timestamp
 * @param {string} signedParams.signature
 * @param {string} signedParams.folder
 * @param {string} signedParams.cloudName
 * @returns {Promise<object>}
 */
export async function uploadScreenshotDirect(blob, signedParams) {
  const { apiKey, timestamp, signature, folder, cloudName } = signedParams;

  const formData = new FormData();
  formData.append("file", blob, "screenshot.webp");
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", folder);

  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  return withRetry(
    async () => {
      const response = await fetch(cloudinaryUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Cloudinary upload failed with status ${response.status}`);
      }

      const data = await response.json();

      return {
        publicId: data.public_id,
        url: data.secure_url || data.url,
        format: data.format || "webp",
        width: data.width,
        height: data.height,
        bytes: data.bytes,
      };
    },
    { retries: 2, baseDelay: 800 }
  );
}

export default uploadScreenshotDirect;
