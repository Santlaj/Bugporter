import Link from "next/link";
import { StatusBadge } from "./status-badge";
import { SeverityBadge } from "./severity-selector";
import { Image as ImageIcon, Laptop, Globe, ArrowRight } from "lucide-react";

export function ReportCard({ report }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700/80 hover:bg-slate-900/90 transition-all flex flex-col justify-between">
      <div>
        {/* Top metadata row */}
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <div className="flex items-center gap-2">
            <StatusBadge status={report.status} />
            <SeverityBadge severity={report.severity} />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            {report.screenshot && (
              <span className="flex items-center gap-1 text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded text-[11px]">
                <ImageIcon className="h-3 w-3 text-indigo-400" />
                Screenshot
              </span>
            )}
            <span>{new Date(report.createdAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Title & Description */}
        <h4 className="text-sm font-semibold text-white hover:text-indigo-300 transition line-clamp-1">
          <Link href={`/dashboard/reports/${report.id}`}>{report.title}</Link>
        </h4>
        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          {report.description}
        </p>

        {/* Environment pills */}
        <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
          <span className="flex items-center gap-1 font-mono text-slate-400">
            <Globe className="h-3 w-3 text-slate-500" />
            {report.route || "/"}
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <Laptop className="h-3 w-3 text-slate-500" />
            {report.browser} {report.browserVersion} • {report.os}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <span className="text-[11px] font-mono text-slate-600 truncate max-w-[200px]">
          ID: {report.id}
        </span>
        <Link
          href={`/dashboard/reports/${report.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
        >
          <span>Investigate</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default ReportCard;
