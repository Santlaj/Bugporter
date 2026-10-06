/**
 * Environment diagnostic model.
 * Collects runtime, client, and screen metadata without fingerprinting.
 */

function detectBrowserAndOS(ua = "") {
  let browser = "Unknown";
  let browserVersion = "Unknown";
  let os = "Unknown";

  // Detect OS
  if (/Windows NT 10.0/i.test(ua)) os = "Windows 10/11";
  else if (/Windows NT 6.3/i.test(ua)) os = "Windows 8.1";
  else if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS X/i.test(ua)) {
    const match = ua.match(/Mac OS X ([0-9_]+)/i);
    os = match ? `macOS ${match[1].replace(/_/g, ".")}` : "macOS";
  } else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  // Detect Browser & Version
  if (/Edg\/([0-9.]+)/i.test(ua)) {
    browser = "Edge";
    browserVersion = ua.match(/Edg\/([0-9.]+)/i)[1];
  } else if (/OPR\/([0-9.]+)/i.test(ua)) {
    browser = "Opera";
    browserVersion = ua.match(/OPR\/([0-9.]+)/i)[1];
  } else if (/Chrome\/([0-9.]+)/i.test(ua)) {
    browser = "Chrome";
    browserVersion = ua.match(/Chrome\/([0-9.]+)/i)[1];
  } else if (/Safari\/([0-9.]+)/i.test(ua) && !/Chrome/i.test(ua)) {
    browser = "Safari";
    const verMatch = ua.match(/Version\/([0-9.]+)/i);
    browserVersion = verMatch ? verMatch[1] : "Unknown";
  } else if (/Firefox\/([0-9.]+)/i.test(ua)) {
    browser = "Firefox";
    browserVersion = ua.match(/Firefox\/([0-9.]+)/i)[1];
  }

  return { browser, browserVersion, os };
}

export const environmentModel = {
  collect() {
    if (typeof window === "undefined") {
      return {};
    }

    const nav = window.navigator || {};
    const ua = nav.userAgent || "";
    const { browser, browserVersion, os } = detectBrowserAndOS(ua);

    let timezone = "UTC";
    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {}

    const loc = window.location || {};
    const route = (loc.pathname || "") + (loc.search || "") + (loc.hash || "");

    return {
      url: loc.href || "",
      route: route || "/",
      browser,
      browserVersion,
      os,
      viewportWidth: window.innerWidth || 0,
      viewportHeight: window.innerHeight || 0,
      screenWidth: window.screen ? window.screen.width : 0,
      screenHeight: window.screen ? window.screen.height : 0,
      devicePixelRatio: window.devicePixelRatio || 1,
      language: nav.language || "en",
      timezone,
      timestamp: Date.now(),
      referrer: typeof document !== "undefined" ? document.referrer || "" : "",
      userAgent: ua,
    };
  },
};

export default environmentModel;
