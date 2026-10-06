import { Network } from "lucide-react";

export function NetworkPanel({ networkEvents = [] }) {
  if (!networkEvents || networkEvents.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-center text-xs text-slate-500">
        No network requests recorded.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-indigo-400" />
          <h4 className="text-xs font-semibold text-slate-200">Network Telemetry ({networkEvents.length} requests)</h4>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-950/60 border-b border-slate-800/80 text-slate-400">
            <tr>
              <th className="py-2.5 px-4 font-medium">Method</th>
              <th className="py-2.5 px-4 font-medium">Status</th>
              <th className="py-2.5 px-4 font-medium">URL</th>
              <th className="py-2.5 px-4 font-medium text-right">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {networkEvents.map((req, idx) => {
              const payload = req.payload || req;
              const status = payload.status || 0;
              const isSuccess = status >= 200 && status < 400;
              const isError = status >= 400;

              return (
                <tr key={idx} className="hover:bg-slate-800/30 transition">
                  <td className="py-2 px-4">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                      {payload.method || "GET"}
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-bold ${
                        isSuccess
                          ? "text-emerald-400 bg-emerald-500/10"
                          : isError
                          ? "text-red-400 bg-red-500/10"
                          : "text-slate-400 bg-slate-800"
                      }`}
                    >
                      {status || "FAILED"}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-slate-300 truncate max-w-md" title={payload.url}>
                    {payload.url}
                  </td>
                  <td className="py-2 px-4 text-right text-slate-400">
                    {payload.duration !== undefined ? `${payload.duration}ms` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default NetworkPanel;
