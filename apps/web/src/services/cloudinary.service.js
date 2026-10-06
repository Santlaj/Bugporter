import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Generate signed parameters for direct browser upload to Cloudinary.
 * @param {string} projectId
 * @param {string} reportId
 * @returns {{ timestamp: number, folder: string, signature: string, apiKey: string, cloudName: string }}
 */
export function generateUploadSignature(projectId, reportId) {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = `bug-reporter/projects/${projectId}/reports/${reportId}`;

  const paramsToSign = {
    folder,
    timestamp,
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET
  );

  return {
    timestamp,
    folder,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  };
}

/**
 * Build an optimized Cloudinary delivery URL with dynamic transformations.
 * @param {string} publicId
 * @param {object} options
 * @returns {string}
 */
export function buildImageUrl(publicId, options = {}) {
  const { width, height, crop = "limit", quality = "auto", format = "webp" } = options;

  const transformation = [
    ...(width ? [{ width }] : []),
    ...(height ? [{ height }] : []),
    { crop },
    { quality },
    { fetch_format: format },
  ];

  return cloudinary.url(publicId, {
    secure: true,
    transformation,
  });
}

export default {
  generateUploadSignature,
  buildImageUrl,
};
