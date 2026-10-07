/**
 * Bug Porter — Standalone Browser SDK & Widget
 * Zero external bundle dependencies. Self-contained Shadow DOM UI & telemetry instrumentation.
 */
(function (global) {
  "use strict";

  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (window.__BUG_REPORTER_INITIALIZED__) return;
  window.__BUG_REPORTER_INITIALIZED__ = true;

  // Configuration
  var config = {
    apiKey: "",
    endpoint: "/api/v1",
    autoMount: true,
  };

  // Telemetry in-memory bounded stores
  var breadcrumbs = [];
  var consoleEvents = [];
  var networkEvents = [];
  var errorEvents = [];
  var selectedElement = null;

  var MAX_BREADCRUMBS = 40;
  var MAX_CONSOLE = 100;
  var MAX_NETWORK = 100;
  var MAX_ERRORS = 50;

  function pushBounded(arr, item, max) {
    arr.push(item);
    if (arr.length > max) arr.shift();
  }

  // URL & String Sanitization
  var SENSITIVE_QUERY_PARAMS = ["token", "key", "apiKey", "api_key", "secret", "password", "auth", "access_token"];
  function redactUrl(urlStr) {
    if (!urlStr || typeof urlStr !== "string") return urlStr;
    try {
      var url = new URL(urlStr, window.location.href);
      SENSITIVE_QUERY_PARAMS.forEach(function (param) {
        if (url.searchParams.has(param)) {
          url.searchParams.set(param, "[REDACTED]");
        }
      });
      return url.toString();
    } catch (e) {
      return urlStr;
    }
  }

  function getEnvironmentSnapshot() {
    var ua = navigator.userAgent || "";
    var browser = "Unknown";
    var browserVersion = "";

    if (/chrome|crios/i.test(ua) && !/edge|edg/i.test(ua)) {
      browser = "Chrome";
      var m = ua.match(/(?:chrome|crios)\/(\d+(\.\d+)?)/i);
      browserVersion = m ? m[1] : "";
    } else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) {
      browser = "Safari";
      var m = ua.match(/version\/(\d+(\.\d+)?)/i);
      browserVersion = m ? m[1] : "";
    } else if (/firefox|fxios/i.test(ua)) {
      browser = "Firefox";
      var m = ua.match(/(?:firefox|fxios)\/(\d+(\.\d+)?)/i);
      browserVersion = m ? m[1] : "";
    } else if (/edg/i.test(ua)) {
      browser = "Edge";
      var m = ua.match(/edg\/(\d+(\.\d+)?)/i);
      browserVersion = m ? m[1] : "";
    }

    var os = "Unknown";
    if (/windows/i.test(ua)) os = "Windows";
    else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
    else if (/linux/i.test(ua)) os = "Linux";
    else if (/android/i.test(ua)) os = "Android";
    else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";

    return {
      url: redactUrl(window.location.href),
      route: window.location.pathname,
      browser: browser,
      browserVersion: browserVersion,
      os: os,
      viewportWidth: window.innerWidth || 0,
      viewportHeight: window.innerHeight || 0,
      devicePixelRatio: window.devicePixelRatio || 1,
      userAgent: ua,
      language: navigator.language || "en",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      referrer: redactUrl(document.referrer) || null,
    };
  }

  // Instrumentation
  function initCapture() {
    // 1. Console instrumentation
    var levels = ["log", "info", "warn", "error"];
    levels.forEach(function (lvl) {
      var orig = console[lvl];
      if (!orig) return;
      console[lvl] = function () {
        try {
          var args = Array.prototype.slice.call(arguments);
          var strArgs = args.map(function (a) {
            if (typeof a === "string") return a;
            try { return JSON.stringify(a); } catch (e) { return String(a); }
          });
          pushBounded(consoleEvents, {
            level: lvl,
            args: strArgs.slice(0, 5),
            stack: lvl === "error" ? new Error().stack : undefined,
            timestamp: new Date().toISOString(),
          }, MAX_CONSOLE);
        } catch (err) {}
        return orig.apply(console, arguments);
      };
    });

    // 2. Unhandled errors
    window.addEventListener("error", function (e) {
      try {
        pushBounded(errorEvents, {
          message: e.message || "Unknown script error",
          filename: e.filename || "",
          lineno: e.lineno || 0,
          colno: e.colno || 0,
          stack: e.error ? e.error.stack : "",
          timestamp: new Date().toISOString(),
        }, MAX_ERRORS);

        pushBounded(breadcrumbs, {
          type: "error",
          message: "Uncaught error: " + (e.message || "Script error"),
          timestamp: new Date().toISOString(),
        }, MAX_BREADCRUMBS);
      } catch (err) {}
    });

    window.addEventListener("unhandledrejection", function (e) {
      try {
        var reason = e.reason || {};
        var msg = reason.message || String(reason);
        pushBounded(errorEvents, {
          message: "Unhandled Promise Rejection: " + msg,
          stack: reason.stack || "",
          timestamp: new Date().toISOString(),
        }, MAX_ERRORS);

        pushBounded(breadcrumbs, {
          type: "error",
          message: "Unhandled promise rejection: " + msg,
          timestamp: new Date().toISOString(),
        }, MAX_BREADCRUMBS);
      } catch (err) {}
    });

    // 3. Fetch instrumentation
    if (window.fetch) {
      var origFetch = window.fetch;
      window.fetch = function (input, init) {
        var url = typeof input === "string" ? input : (input && input.url ? input.url : "");
        var method = (init && init.method) ? init.method.toUpperCase() : "GET";
        var start = Date.now();

        return origFetch.apply(this, arguments).then(
          function (res) {
            try {
              // Don't record reports ingestion calls into telemetry to avoid self-loops
              if (!url.includes("/api/v1/reports") && !url.includes("cloudinary.com")) {
                pushBounded(networkEvents, {
                  type: "fetch",
                  method: method,
                  url: redactUrl(url),
                  status: res.status,
                  duration: Date.now() - start,
                  timestamp: new Date().toISOString(),
                }, MAX_NETWORK);

                // Auto-record HTTP 4xx/5xx responses as console errors so developers see them in the console panel
                if (res.status >= 400) {
                  pushBounded(consoleEvents, {
                    level: "error",
                    args: ["Failed to load resource: the server responded with a status of " + res.status + " (" + method + " " + redactUrl(url) + ")"],
                    timestamp: new Date().toISOString(),
                  }, MAX_CONSOLE);
                }
              }
            } catch (e) {}
            return res;
          },
          function (err) {
            try {
              if (!url.includes("/api/v1/reports") && !url.includes("cloudinary.com")) {
                pushBounded(networkEvents, {
                  type: "fetch",
                  method: method,
                  url: redactUrl(url),
                  status: 0,
                  error: err.message || "Network request failed",
                  duration: Date.now() - start,
                  timestamp: new Date().toISOString(),
                }, MAX_NETWORK);

                pushBounded(consoleEvents, {
                  level: "error",
                  args: ["NetworkError: " + (err.message || "Request failed") + " (" + method + " " + redactUrl(url) + ")"],
                  timestamp: new Date().toISOString(),
                }, MAX_CONSOLE);
              }
            } catch (e) {}
            throw err;
          }
        );
      };
    }

    // 4. Click breadcrumbs
    document.addEventListener("click", function (e) {
      try {
        var target = e.target;
        if (!target || target.closest("#bug-reporter-host")) return;

        var tag = target.tagName ? target.tagName.toLowerCase() : "";
        var id = target.id ? "#" + target.id : "";
        var cls = target.className && typeof target.className === "string"
          ? "." + target.className.trim().split(/\s+/).slice(0, 2).join(".")
          : "";
        var text = (target.innerText || target.value || "").trim().slice(0, 30);
        var label = "<" + tag + id + cls + ">" + (text ? ' "' + text + '"' : "");

        pushBounded(breadcrumbs, {
          type: "click",
          message: "Clicked " + label,
          timestamp: new Date().toISOString(),
        }, MAX_BREADCRUMBS);
      } catch (err) {}
    }, true);

    // 5. Navigation breadcrumbs
    var recordNav = function (action, url) {
      pushBounded(breadcrumbs, {
        type: "navigation",
        message: "Navigated (" + action + ") to " + redactUrl(url || window.location.pathname),
        timestamp: new Date().toISOString(),
      }, MAX_BREADCRUMBS);
    };

    var origPush = window.history.pushState;
    if (origPush) {
      window.history.pushState = function (state, title, url) {
        recordNav("pushState", url);
        return origPush.apply(this, arguments);
      };
    }

    var origReplace = window.history.replaceState;
    if (origReplace) {
      window.history.replaceState = function (state, title, url) {
        recordNav("replaceState", url);
        return origReplace.apply(this, arguments);
      };
    }

    window.addEventListener("popstate", function () {
      recordNav("popstate", window.location.pathname);
    });

    window.addEventListener("hashchange", function () {
      recordNav("hashchange", window.location.hash);
    });
  }

  // Screenshot helper (html2canvas with failure isolation)
  function captureScreenshot() {
    return new Promise(function (resolve) {
      function runHtml2Canvas(h2c) {
        try {
          var width = window.innerWidth;
          var height = window.innerHeight;
          var scrollX = window.scrollX || 0;
          var scrollY = window.scrollY || 0;

          // Temporarily hide the widget in the real DOM during snapshot rendering
          var realHost = document.getElementById("bug-reporter-host");
          var prevVisibility = realHost ? realHost.style.visibility : "";
          if (realHost) {
            realHost.style.visibility = "hidden";
          }

          function restoreHost() {
            if (realHost) {
              realHost.style.visibility = prevVisibility;
            }
          }

          h2c(document.body, {
            width: width,
            height: height,
            x: scrollX,
            y: scrollY,
            windowWidth: width,
            windowHeight: height,
            useCORS: true,
            allowTaint: false,
            logging: false,
            ignoreElements: function (element) {
              if (!element) return false;
              if (element.id === "bug-reporter-host") return true;
              if (element.getAttribute && element.getAttribute("data-html2canvas-ignore") === "true") return true;
              if (element.classList && (element.classList.contains("br-picker-overlay") || element.classList.contains("br-picker-box"))) return true;
              return false;
            },
            onclone: function (doc) {
              // 1. Remove bug reporter widget and overlays from the clone completely
              try {
                var brHost = doc.getElementById("bug-reporter-host");
                if (brHost && brHost.parentNode) {
                  brHost.parentNode.removeChild(brHost);
                }
                var brElements = doc.querySelectorAll("[data-html2canvas-ignore], .br-picker-overlay, .br-picker-box, [id*='bug-reporter']");
                for (var j = 0; j < brElements.length; j++) {
                  if (brElements[j].parentNode) brElements[j].parentNode.removeChild(brElements[j]);
                }
              } catch (e) {}

              // 2. Privacy masking on clone
              try {
                var masked = doc.querySelectorAll("[data-bug-mask], input[type=password]");
                for (var i = 0; i < masked.length; i++) {
                  var el = masked[i];
                  if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
                    el.value = "••••••••";
                  } else {
                    el.innerText = "••••••••";
                  }
                }
              } catch (e) {}
            },
          }).then(function (canvas) {
            restoreHost();
            canvas.toBlob(function (blob) {
              if (blob) {
                resolve({ blob: blob, width: canvas.width, height: canvas.height, format: "png" });
              } else {
                resolve(null);
              }
            }, "image/png");
          }).catch(function () {
            restoreHost();
            resolve(null);
          });
        } catch (e) {
          if (realHost) realHost.style.visibility = prevVisibility;
          resolve(null);
        }
      }

      if (window.html2canvas) {
        runHtml2Canvas(window.html2canvas);
      } else {
        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";
        script.async = true;
        script.onload = function () {
          if (window.html2canvas) runHtml2Canvas(window.html2canvas);
          else resolve(null);
        };
        script.onerror = function () { resolve(null); };
        document.head.appendChild(script);
      }
    });
  }

  // Shadow DOM UI
  var WIDGET_CSS = [
    ":host { all: initial; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; line-height: 1.5; color: #f1f5f9; -webkit-font-smoothing: antialiased; }",
    "*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }",
    ".br-trigger-btn { position: fixed; bottom: 20px; right: 20px; z-index: 2147483640; width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff; border: 1px solid rgba(255,255,255,0.25); box-shadow: 0 10px 25px -5px rgba(99,102,241,0.5), 0 8px 10px -6px rgba(0,0,0,0.4); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 20px; transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s; user-select: none; }",
    ".br-trigger-btn:hover { transform: scale(1.08); box-shadow: 0 15px 30px -5px rgba(99,102,241,0.65); }",
    ".br-trigger-btn:active { transform: scale(0.95); }",
    ".br-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); z-index: 2147483641; display: flex; align-items: center; justify-content: center; padding: 16px; opacity: 0; pointer-events: none; transition: opacity 0.2s ease; }",
    ".br-backdrop.br-open { opacity: 1; pointer-events: auto; }",
    ".br-modal { width: 100%; max-width: 440px; background: #0f172a; border: 1px solid #334155; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.75); overflow: hidden; transform: scale(0.95) translateY(10px); transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; }",
    ".br-backdrop.br-open .br-modal { transform: scale(1) translateY(0); }",
    ".br-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-bottom: 1px solid #1e293b; background: #1e293b; }",
    ".br-title { font-size: 14px; font-weight: 600; color: #f8fafc; display: flex; align-items: center; gap: 8px; }",
    ".br-close-btn { background: transparent; border: none; color: #94a3b8; cursor: pointer; padding: 4px 8px; border-radius: 6px; font-size: 18px; line-height: 1; transition: color 0.15s, background 0.15s; }",
    ".br-close-btn:hover { color: #f8fafc; background: #334155; }",
    ".br-body { padding: 18px; display: flex; flex-direction: column; gap: 14px; }",
    ".br-label { font-size: 12px; font-weight: 500; color: #cbd5e1; }",
    ".br-textarea { width: 100%; min-height: 90px; max-height: 180px; padding: 10px 12px; background: #1e293b; border: 1px solid #334155; border-radius: 8px; color: #f8fafc; font-size: 13px; line-height: 1.5; resize: vertical; outline: none; transition: border-color 0.15s, box-shadow 0.15s; }",
    ".br-textarea:focus { border-color: #6366f1; box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25); }",
    ".br-element-badge { display: flex; align-items: center; justify-content: space-between; background: rgba(99, 102, 241, 0.12); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 8px; padding: 8px 12px; font-size: 12px; color: #a5b4fc; }",
    ".br-picker-btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: #1e293b; border: 1px solid #334155; border-radius: 6px; color: #cbd5e1; font-size: 12px; cursor: pointer; transition: background 0.15s, border-color 0.15s; }",
    ".br-picker-btn:hover { background: #334155; border-color: #475569; }",
    ".br-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 14px 18px; border-top: 1px solid #1e293b; background: #131c31; }",
    ".br-btn { padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s ease; border: none; }",
    ".br-btn-secondary { background: #1e293b; color: #cbd5e1; border: 1px solid #334155; }",
    ".br-btn-secondary:hover { background: #334155; color: #ffffff; }",
    ".br-btn-primary { background: #6366f1; color: #ffffff; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }",
    ".br-btn-primary:hover { background: #4f46e5; }",
    ".br-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }",
    ".br-hp { position: absolute; opacity: 0; pointer-events: none; height: 0; width: 0; }",
    ".br-picker-overlay { position: fixed; inset: 0; z-index: 2147483645; cursor: crosshair; background: rgba(15, 23, 42, 0.05); display: none; }",
    ".br-picker-overlay.br-active { display: block; }",
    ".br-picker-box { position: absolute; pointer-events: none; border: 2px solid #6366f1; background: rgba(99, 102, 241, 0.15); border-radius: 4px; display: none; z-index: 2147483646; }",
    ".br-spinner { width: 28px; height: 28px; border: 3px solid #334155; border-top-color: #6366f1; border-radius: 50%; animation: br-spin 0.8s linear infinite; margin: 20px auto; }",
    "@keyframes br-spin { to { transform: rotate(360deg); } }",
    ".br-success { text-align: center; padding: 24px 16px; color: #10b981; font-weight: 500; }",
  ].join("\n");

  function createWidgetUI() {
    var host = document.createElement("div");
    host.id = "bug-reporter-host";
    host.setAttribute("data-html2canvas-ignore", "true");
    document.body.appendChild(host);

    var shadow = host.attachShadow({ mode: "open" });

    var style = document.createElement("style");
    style.textContent = WIDGET_CSS;
    shadow.appendChild(style);

    // Trigger button
    var triggerBtn = document.createElement("button");
    triggerBtn.className = "br-trigger-btn";
    triggerBtn.title = "Report a Bug";
    triggerBtn.innerHTML = "🐞";
    shadow.appendChild(triggerBtn);

    // Modal Backdrop
    var backdrop = document.createElement("div");
    backdrop.className = "br-backdrop";
    backdrop.setAttribute("data-html2canvas-ignore", "true");
    backdrop.innerHTML = [
      '<div class="br-modal">',
      '  <div class="br-header">',
      '    <div class="br-title"><span>🐞</span><span>Report a Bug</span></div>',
      '    <button class="br-close-btn">&times;</button>',
      '  </div>',
      '  <div class="br-body">',
      '    <label class="br-label">Describe what happened or went wrong:</label>',
      '    <textarea class="br-textarea" placeholder="e.g. Button is unresponsive, data failed to save, layout is broken..."></textarea>',
      '    <div class="br-element-section">',
      '      <button class="br-picker-btn" type="button">🎯 Select element on page</button>',
      '      <div class="br-element-badge" style="display:none; margin-top:8px;">',
      '        <span class="br-element-tag font-mono"></span>',
      '        <button class="br-element-clear" style="background:none; border:none; color:#a5b4fc; cursor:pointer;">&times;</button>',
      '      </div>',
      '    </div>',
      '    <input type="text" class="br-hp" tabindex="-1" autocomplete="off" />',
      '  </div>',
      '  <div class="br-footer">',
      '    <button class="br-btn br-btn-secondary br-cancel-btn">Cancel</button>',
      '    <button class="br-btn br-btn-primary br-submit-btn">Send Bug Report</button>',
      '  </div>',
      '</div>',
    ].join("");
    shadow.appendChild(backdrop);

    // Element picker overlay
    var overlay = document.createElement("div");
    overlay.className = "br-picker-overlay";
    overlay.setAttribute("data-html2canvas-ignore", "true");
    document.body.appendChild(overlay);

    var highlightBox = document.createElement("div");
    highlightBox.className = "br-picker-box";
    highlightBox.setAttribute("data-html2canvas-ignore", "true");
    document.body.appendChild(highlightBox);

    var textarea = backdrop.querySelector(".br-textarea");
    var closeBtn = backdrop.querySelector(".br-close-btn");
    var cancelBtn = backdrop.querySelector(".br-cancel-btn");
    var submitBtn = backdrop.querySelector(".br-submit-btn");
    var pickerBtn = backdrop.querySelector(".br-picker-btn");
    var elementBadge = backdrop.querySelector(".br-element-badge");
    var elementTagText = backdrop.querySelector(".br-element-tag");
    var elementClearBtn = backdrop.querySelector(".br-element-clear");
    var hpInput = backdrop.querySelector(".br-hp");
    var modalBody = backdrop.querySelector(".br-body");

    function openModal() {
      backdrop.classList.add("br-open");
      textarea.focus();
    }

    function closeModal() {
      backdrop.classList.remove("br-open");
    }

    triggerBtn.addEventListener("click", openModal);
    closeBtn.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);
    backdrop.addEventListener("click", function (e) {
      if (e.target === backdrop) closeModal();
    });

    // Element picker logic
    function startElementPicker() {
      closeModal();
      overlay.classList.add("br-active");
      highlightBox.style.display = "block";

      function onMouseMove(e) {
        var el = document.elementFromPoint(e.clientX, e.clientY);
        if (!el || el === overlay || el.closest("#bug-reporter-host") || el === highlightBox) return;

        var rect = el.getBoundingClientRect();
        highlightBox.style.width = rect.width + "px";
        highlightBox.style.height = rect.height + "px";
        highlightBox.style.top = (rect.top + window.scrollY) + "px";
        highlightBox.style.left = (rect.left + window.scrollX) + "px";
      }

      function onElementClick(e) {
        e.preventDefault();
        e.stopPropagation();

        overlay.classList.remove("br-active");
        highlightBox.style.display = "none";
        document.removeEventListener("mousemove", onMouseMove);
        overlay.removeEventListener("click", onElementClick);

        var target = document.elementFromPoint(e.clientX, e.clientY);
        if (target && target !== overlay && !target.closest("#bug-reporter-host")) {
          var tag = target.tagName ? target.tagName.toLowerCase() : "";
          var id = target.id ? "#" + target.id : "";
          var cls = target.className && typeof target.className === "string"
            ? "." + target.className.trim().split(/\s+/)[0]
            : "";
          var selector = tag + id + cls;
          var textSnippet = (target.innerText || target.value || "").trim().slice(0, 100);

          selectedElement = {
            tag: tag,
            selector: selector,
            text: textSnippet,
            rect: target.getBoundingClientRect().toJSON ? target.getBoundingClientRect().toJSON() : null,
          };

          elementTagText.textContent = "Target: <" + selector + ">";
          elementBadge.style.display = "flex";
        }

        openModal();
      }

      document.addEventListener("mousemove", onMouseMove);
      overlay.addEventListener("click", onElementClick);
    }

    pickerBtn.addEventListener("click", startElementPicker);

    elementClearBtn.addEventListener("click", function () {
      selectedElement = null;
      elementBadge.style.display = "none";
    });

    // Submit report logic
    submitBtn.addEventListener("click", function () {
      var description = textarea.value.trim();
      if (!description) {
        textarea.style.borderColor = "#ef4444";
        textarea.focus();
        return;
      }

      if (hpInput.value.trim().length > 0) {
        // Honeypot trapped
        closeModal();
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Capturing...";
      modalBody.innerHTML = '<div class="br-spinner"></div><p style="text-align:center; font-size:12px; color:#94a3b8;">Capturing screenshot and sending report...</p>';

      var env = getEnvironmentSnapshot();

      // Normalize endpoint
      var ep = config.endpoint.replace(/\/+$/, "");
      var reportUrl = ep.endsWith("/reports") ? ep : ep + "/reports";

      // 1. Capture screenshot
      captureScreenshot().then(function (screenshotData) {
        var payload = {
          apiKey: config.apiKey,
          description: description,
          environment: env,
          breadcrumbs: breadcrumbs,
          consoleEvents: consoleEvents,
          networkEvents: networkEvents,
          element: selectedElement,
          honeypot: hpInput.value,
        };

        // 2. Submit report
        return fetch(reportUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
          .then(function (res) {
            if (!res.ok) {
              return res.json().then(function (errBody) {
                var msg = errBody.error || ("Server returned " + res.status);
                throw new Error(msg);
              }).catch(function (e) {
                throw new Error(e.message || ("Server returned " + res.status));
              });
            }
            return res.json();
          })
          .then(function (reportRes) {
            var reportId = reportRes.reportId;

            // 3. Upload screenshot to Cloudinary if available
            if (screenshotData && screenshotData.blob && reportId) {
              var sigUrl = ep + "/reports/" + reportId + "/upload-signature";
              return fetch(sigUrl, { method: "POST", headers: { "Content-Type": "application/json" } })
                .then(function (sigRes) { return sigRes.ok ? sigRes.json() : null; })
                .then(function (sigData) {
                  if (!sigData || !sigData.signature) return reportRes;

                  var uploadTarget = sigData.uploadUrl || (sigData.cloudName ? ("https://api.cloudinary.com/v1_1/" + sigData.cloudName + "/image/upload") : null);
                  if (!uploadTarget) return reportRes;

                  var formData = new FormData();
                  formData.append("file", screenshotData.blob, "screenshot.png");
                  formData.append("api_key", sigData.apiKey);
                  formData.append("timestamp", sigData.timestamp);
                  formData.append("signature", sigData.signature);
                  formData.append("folder", sigData.folder || "bug-reports");

                  return fetch(uploadTarget, { method: "POST", body: formData })
                    .then(function (cRes) { return cRes.ok ? cRes.json() : null; })
                    .then(function (cData) {
                      if (!cData) return reportRes;
                      var compUrl = ep + "/reports/" + reportId + "/complete";
                      return fetch(compUrl, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          provider: "cloudinary",
                          publicId: cData.public_id,
                          url: cData.secure_url || cData.url,
                          format: cData.format || "png",
                          width: Math.round(cData.width || screenshotData.width || 1),
                          height: Math.round(cData.height || screenshotData.height || 1),
                          bytes: Math.round(cData.bytes || (screenshotData.blob ? screenshotData.blob.size : 1024)),
                        }),
                      });
                    });
                })
                .then(function () { return reportRes; });
            }
            return reportRes;
          });
      })
      .then(function () {
        modalBody.innerHTML = '<div class="br-success"><span>✅ Bug report submitted successfully!</span><br/><small style="color:#94a3b8; font-size:11px;">The development team has been notified.</small></div>';
        setTimeout(function () {
          closeModal();
          // Reset modal form
          setTimeout(function () {
            location.reload ? null : null;
          }, 300);
        }, 2200);
      })
      .catch(function (err) {
        modalBody.innerHTML = '<div style="text-align:center; padding:20px; color:#ef4444;"><p>Failed to submit report</p><small style="color:#94a3b8; font-size:11px;">' + (err.message || "Network error") + '</small></div>';
        setTimeout(function () {
          closeModal();
        }, 3000);
      });
    });
  }

  // Auto-init via script tag
  function autoInit() {
    var scripts = document.querySelectorAll("script[data-key]");
    var currentScript = document.currentScript || (scripts.length > 0 ? scripts[scripts.length - 1] : null);

    if (currentScript) {
      var key = currentScript.getAttribute("data-key");
      var endpoint = currentScript.getAttribute("data-endpoint");
      if (key) {
        config.apiKey = key;
        if (endpoint) config.endpoint = endpoint;
        initCapture();
        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", createWidgetUI);
        } else {
          createWidgetUI();
        }
      }
    }
  }

  // Public SDK API
  global.BugReporter = {
    init: function (opts) {
      if (opts) {
        if (opts.apiKey) config.apiKey = opts.apiKey;
        if (opts.endpoint) config.endpoint = opts.endpoint;
      }
      initCapture();
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", createWidgetUI);
      } else {
        createWidgetUI();
      }
    },
    version: "1.0.0",
  };

  autoInit();
})(typeof window !== "undefined" ? window : this);
