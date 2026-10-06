import { MousePointer, Compass, AlertTriangle, WifiOff, Clock } from "lucide-react";

const EVENT_ICONS = {
  click: { icon: MousePointer, color: "text-indigo-400", bg: "bg-indigo-500/10" },
  navigation: { icon: Compass, color: "text-blue-400", bg: "bg-blue-500/10" },
  console_error: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10" },
  network_error: { icon: WifiOff, color: "text-red-400", bg: "bg-red-500/10" },
};

export function BreadcrumbTimeline({ breadcrumbs = [] }) {
  if (!breadcrumbs || breadcrumbs.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-center text-xs text-slate-500">
        No breadcrumb history recorded.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-slate-300">
          User Interaction Timeline ({breadcrumbs.length} events)
        </h4>
        <span className="text-[11px] text-slate-500">Chronological order</span>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {breadcrumbs.map((crumb, idx) => {
          const payload = crumb.payload || crumb;
          const type = payload.type || "click";
          const iconConfig = EVENT_ICONS[type] || EVENT_ICONS.click;
          const Icon = iconConfig.icon;

          return (
            <div key={idx} className="relative flex items-start gap-3 group">
              {/* Timeline marker icon */}
              <div
                className={`absolute -left-6 top-0.5 h-5 w-5 rounded-full border border-slate-800 ${iconConfig.bg} flex items-center justify-center`}
              >
                <Icon className={`h-2.5 w-2.5 ${iconConfig.color}`} />
              </div>

              {/* Event content */}
              <div className="flex-1 bg-slate-900/50 border border-slate-800/80 rounded-lg p-2.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-200">{payload.message}</span>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap">
                    {new Date(crumb.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                {payload.data && Object.keys(payload.data).length > 0 && (
                  <div className="mt-1.5 pt-1.5 border-t border-slate-800/60 font-mono text-[11px] text-slate-400 flex flex-wrap gap-x-3 gap-y-1">
                    {Object.entries(payload.data).map(([k, v]) => (
                      <span key={k}>
                        <strong className="text-slate-500 font-normal">{k}:</strong>{" "}
                        {typeof v === "object" ? JSON.stringify(v) : String(v)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BreadcrumbTimeline;
