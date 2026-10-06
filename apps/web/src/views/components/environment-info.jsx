import { Laptop, Monitor, Globe, Clock, Target, Compass } from "lucide-react";

export function EnvironmentInfo({ report }) {
  const items = [
    { label: "Browser", value: `${report.browser} ${report.browserVersion}`, icon: Laptop },
    { label: "Operating System", value: report.os, icon: Monitor },
    { label: "Viewport", value: `${report.viewportWidth} × ${report.viewportHeight} px`, icon: Monitor },
    { label: "Device Pixel Ratio", value: `${report.devicePixelRatio}x`, icon: Monitor },
    { label: "Route", value: report.route || "/", icon: Compass },
    { label: "Timezone", value: report.timezone || "UTC", icon: Clock },
    { label: "Language", value: report.language || "en", icon: Globe },
    { label: "Referrer", value: report.referrer || "Direct", icon: Globe },
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
      <h4 className="text-xs font-semibold text-slate-200">Environment & Client Context</h4>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
                <Icon className="h-3 w-3 text-slate-400" />
                <span>{item.label}</span>
              </div>
              <p className="text-xs font-medium text-slate-200 truncate" title={item.value}>
                {item.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Target Element Metadata if selected */}
      {report.elementSelector && (
        <div className="mt-4 p-3 bg-indigo-950/20 border border-indigo-900/40 rounded-lg space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
            <Target className="h-3.5 w-3.5" />
            <span>Targeted Element</span>
          </div>
          <div className="font-mono text-xs text-indigo-200">
            &lt;{report.elementTag || "element"}&gt; <code className="text-indigo-400">{report.elementSelector}</code>
          </div>
          {report.elementText && (
            <p className="text-xs text-slate-400 mt-1">&ldquo;{report.elementText}&rdquo;</p>
          )}
        </div>
      )}
    </div>
  );
}

export default EnvironmentInfo;
