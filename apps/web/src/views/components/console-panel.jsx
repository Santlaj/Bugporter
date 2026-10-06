"use client";

import { Terminal, AlertCircle, AlertTriangle, Info } from "lucide-react";

export function ConsolePanel({ consoleEvents = [] }) {
  if (!consoleEvents || consoleEvents.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-center text-xs text-slate-500">
        No console errors or warnings intercepted.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden font-mono text-xs">
      {/* Terminal Header */}
      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-indigo-400" />
          <span className="font-semibold text-slate-200">Console Telemetry</span>
        </div>
        <span className="text-[11px] text-slate-500">{consoleEvents.length} events logged</span>
      </div>

      {/* Log list */}
      <div className="divide-y divide-slate-900 max-h-96 overflow-y-auto p-2 space-y-1">
        {consoleEvents.map((ev, idx) => {
          const payload = ev.payload || ev;
          const level = payload.level || "log";
          const args = payload.args || [];
          const isError = level === "error";
          const isWarn = level === "warn";

          return (
            <div
              key={idx}
              className={`p-2.5 rounded flex items-start gap-2.5 ${
                isError ? "bg-red-950/20 text-red-300" : isWarn ? "bg-amber-950/20 text-amber-300" : "text-slate-300"
              }`}
            >
              {isError ? (
                <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
              ) : isWarn ? (
                <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Info className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="uppercase text-[10px] font-bold tracking-wider opacity-70">
                    [{level}]
                  </span>
                  <span className="text-[10px] opacity-40">
                    {new Date(ev.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="mt-1 whitespace-pre-wrap break-all leading-relaxed">
                  {args.join(" ")}
                </div>

                {payload.stack && (
                  <pre className="mt-2 p-2 bg-slate-950/80 rounded text-[11px] text-red-400/80 overflow-x-auto border border-red-950/50">
                    {payload.stack}
                  </pre>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ConsolePanel;
