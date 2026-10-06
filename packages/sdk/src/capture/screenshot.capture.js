import { maskDomTree } from "../privacy/mask-dom";

const MAX_DIMENSION = 3000;
const WEBP_QUALITY = 0.82;
const MAX_BLOB_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Lazy loads html2canvas only when a screenshot is requested.
 */
async function loadHtml2Canvas() {
  if (typeof window !== "undefined" && window.html2canvas) {
    return window.html2canvas;
  }

  // Attempt dynamic import if available in modern bundlers
  try {
    const module = await import("html2canvas");
    return module.default || module;
  } catch {
    // CDN fallback when running unbundled or in vanilla browser injection
    return new Promise((resolve, reject) => {
      if (typeof document === "undefined") {
        return reject(new Error("Document not available for screenshot"));
      }

      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";
      script.async = true;
      script.onload = () => {
        if (window.html2canvas) {
          resolve(window.html2canvas);
        } else {
          reject(new Error("html2canvas failed to initialize"));
        }
      };
      script.onerror = () => reject(new Error("Failed to load html2canvas from CDN"));
      document.head.appendChild(script);
    });
  }
}

/**
 * Resizes canvas if any dimension exceeds MAX_DIMENSION (3000px).
 * @param {HTMLCanvasElement} canvas
 * @returns {HTMLCanvasElement}
 */
function enforceCanvasDimensions(canvas) {
  let { width, height } = canvas;

  if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
    return canvas;
  }

  const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
  const targetWidth = Math.round(width * ratio);
  const targetHeight = Math.round(height * ratio);

  const scaledCanvas = document.createElement("canvas");
  scaledCanvas.width = targetWidth;
  scaledCanvas.height = targetHeight;

  const ctx = scaledCanvas.getContext("2d");
  if (ctx) {
    ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);
    return scaledCanvas;
  }

  return canvas;
}

/**
 * Converts a canvas to a WebP blob with PNG fallback.
 * @param {HTMLCanvasElement} canvas
 * @returns {Promise<{ blob: Blob, format: string }>}
 */
function canvasToWebpBlob(canvas) {
  return new Promise((resolve, reject) => {
    // Try WebP first
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve({ blob, format: "webp" });
        } else {
          // Fallback to PNG
          canvas.toBlob(
            (pngBlob) => {
              if (pngBlob) {
                resolve({ blob: pngBlob, format: "png" });
              } else {
                reject(new Error("Failed to generate image blob"));
              }
            },
            "image/png"
          );
        }
      },
      "image/webp",
      WEBP_QUALITY
    );
  });
}

/**
 * Captures a viewport screenshot with DOM privacy masking.
 * Never throws — returns null on failure so report submission is never blocked.
 * @returns {Promise<{ blob: Blob, format: string, width: number, height: number, bytes: number } | null>}
 */
export async function captureScreenshot() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return null;
  }

  try {
    const html2canvas = await loadHtml2Canvas();
    if (!html2canvas) return null;

    // Viewport dimensions & scroll offset
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollX = window.scrollX || window.pageXOffset || 0;
    const scrollY = window.scrollY || window.pageYOffset || 0;

    // Render viewport to canvas
    const rawCanvas = await html2canvas(document.body, {
      width: viewportWidth,
      height: viewportHeight,
      x: scrollX,
      y: scrollY,
      windowWidth: viewportWidth,
      windowHeight: viewportHeight,
      useCORS: true,
      allowTaint: false,
      logging: false,
      ignoreElements: (element) => {
        if (!element) return false;
        if (element.id === "bug-reporter-host") return true;
        if (element.getAttribute && element.getAttribute("data-html2canvas-ignore") === "true") return true;
        if (element.classList && (element.classList.contains("br-picker-overlay") || element.classList.contains("br-picker-box"))) return true;
        return false;
      },
      onclone: (clonedDoc) => {
        try {
          const brHost = clonedDoc.getElementById("bug-reporter-host");
          if (brHost && brHost.parentNode) {
            brHost.parentNode.removeChild(brHost);
          }
          const brElements = clonedDoc.querySelectorAll("[data-html2canvas-ignore], .br-picker-overlay, .br-picker-box, [id*='bug-reporter']");
          brElements.forEach((el) => {
            if (el.parentNode) el.parentNode.removeChild(el);
          });
        } catch {}

        // Apply privacy masking to the cloned DOM tree
        maskDomTree(clonedDoc.body);
      },
    });

    if (!rawCanvas) return null;

    // Enforce dimension constraints
    const sizedCanvas = enforceCanvasDimensions(rawCanvas);

    // Convert to WebP blob
    const { blob, format } = await canvasToWebpBlob(sizedCanvas);

    if (blob.size > MAX_BLOB_BYTES) {
      console.warn("[BugReporter] Screenshot exceeded 5MB size limit; dropping screenshot.");
      return null;
    }

    return {
      blob,
      format,
      width: sizedCanvas.width,
      height: sizedCanvas.height,
      bytes: blob.size,
    };
  } catch (err) {
    // Failure isolation: log warning and degrade gracefully
    if (typeof console !== "undefined" && console.warn) {
      console.warn("[BugReporter] Screenshot capture failed gracefully:", err.message);
    }
    return null;
  }
}

export default {
  captureScreenshot,
};
