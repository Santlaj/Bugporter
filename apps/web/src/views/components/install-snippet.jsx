"use client";

import { useState, useEffect } from "react";
import { Check, Copy, Code2, ShieldAlert, Sparkles } from "lucide-react";

export function InstallSnippet({ apiKey = "pk_your_project_key", endpoint }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("script");
  const [origin, setOrigin] = useState("http://localhost:3000");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const apiEndpoint = endpoint || `${origin}/api/v1`;
  const widgetScriptUrl = `${origin}/widget.js`;

  const scriptSnippet = `<!-- Bug Porter Widget -->
<script
  async
  src="${widgetScriptUrl}"
  data-key="${apiKey}"
  data-endpoint="${apiEndpoint}">
</script>`;

  const nextJsSnippet = `// Next.js App Router (app/layout.jsx or pages/_app.jsx)
import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Script
          src="${widgetScriptUrl}"
          data-key="${apiKey}"
          data-endpoint="${apiEndpoint}"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}`;

  const currentSnippet = activeTab === "script" ? scriptSnippet : nextJsSnippet;

  const handleCopy = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(currentSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Code2 className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-200">Integration Snippet</h4>
            <p className="text-[11px] text-slate-400">Embed directly into any deployed website</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-[11px]">
            <button
              onClick={() => setActiveTab("script")}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                activeTab === "script"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              HTML / Vanilla
            </button>
            <button
              onClick={() => setActiveTab("nextjs")}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                activeTab === "nextjs"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Next.js / React
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-white" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="relative rounded-lg bg-slate-950 border border-slate-800 p-3.5 font-mono text-xs text-indigo-300 overflow-x-auto selection:bg-indigo-900">
        <pre className="whitespace-pre">{currentSnippet}</pre>
      </div>

      {/* Privacy note */}
      <div className="rounded-lg bg-slate-950/60 border border-slate-800/80 p-3 text-[11px] text-slate-400 flex items-start gap-2.5">
        <ShieldAlert className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-300">Privacy-First Masking: </span>
          Any element on your website with <code className="text-emerald-400 font-mono">data-bug-mask</code> or <code className="text-emerald-400 font-mono">type=&quot;password&quot;</code> will be automatically redacted in browser memory before screenshot and report submission.
        </div>
      </div>
    </div>
  );
}

export default InstallSnippet;
