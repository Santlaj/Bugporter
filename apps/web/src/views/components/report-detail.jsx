"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Calendar, Hash, Shield } from "lucide-react";
import { StatusBadge } from "./status-badge";
import { SeverityBadge } from "./severity-selector";
import { ScreenshotViewer } from "./screenshot-viewer";
import { BreadcrumbTimeline } from "./breadcrumb-timeline";
import { ConsolePanel } from "./console-panel";
import { NetworkPanel } from "./network-panel";
import { EnvironmentInfo } from "./environment-info";

export function ReportDetail({
  report,
  onStatusChange = () => {},
  onSeverityChange = () => {},
}) {
  const [currentStatus, setCurrentStatus] = useState(report.status);
  const [currentSeverity, setCurrentSeverity] = useState(report.severity);

  const handleStatusUpdate = (newStatus) => {
    setCurrentStatus(newStatus);
    onStatusChange(report.id, newStatus);
  };

  const handleSeverityUpdate = (newSeverity) => {
    setCurrentSeverity(newSeverity);
    onSeverityChange(report.id, newSeverity);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top back navigation */}
      <div>
        <Link
          href={`/dashboard/projects/${report.projectId}/reports`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Reports</span>
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <StatusBadge status={currentStatus} />
            <SeverityBadge
              severity={currentSeverity}
              interactive={true}
              onChange={handleSeverityUpdate}
            />
            {/* Status change select */}
            <select
              value={currentStatus}
              onChange={(e) => handleStatusUpdate(e.target.value)}
              aria-label="Change report status"
              className="text-xs font-semibold bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-300 outline-none cursor-pointer hover:border-slate-700"
            >
              <option value="OPEN">Mark as Open</option>
              <option value="IN_PROGRESS">Mark as In Progress</option>
              <option value="RESOLVED">Mark as Resolved</option>
              <option value="IGNORED">Mark as Ignored</option>
              <option value="DUPLICATE">Mark as Duplicate</option>
            </select>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-mono">
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              {new Date(report.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          {report.title}
        </h1>

        <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
          {report.description}
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 flex-wrap">
          <a
            href={report.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition"
          >
            <span>{report.url}</span>
            <ExternalLink className="h-3 w-3" />
          </a>
          <span>•</span>
          <span className="font-mono text-slate-500">ID: {report.id}</span>
        </div>
      </div>

      {/* Grid: Diagnostics and Telemetry Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Visual & Telemetry */}
        <div className="lg:col-span-2 space-y-8">
          {/* Screenshot */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <ScreenshotViewer screenshot={report.screenshot} />
          </div>

          {/* Breadcrumb timeline */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <BreadcrumbTimeline breadcrumbs={report.breadcrumbs} />
          </div>

          {/* Console errors panel */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <ConsolePanel consoleEvents={report.consoleEvents} />
          </div>

          {/* Network panel */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <NetworkPanel networkEvents={report.networkEvents} />
          </div>
        </div>

        {/* Right 1 Column: Environment, Fingerprint & Metadata */}
        <div className="space-y-6">
          <EnvironmentInfo report={report} />

          {/* Deduplication & Fingerprint Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Hash className="h-4 w-4 text-indigo-400" />
              <span>Deduplication Fingerprint</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Reports with matching error normalized text, stack trace, and route share this SHA-256 fingerprint.
            </p>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 font-mono text-[10px] text-indigo-300 break-all select-all">
              {report.fingerprint}
            </div>
          </div>

          {/* Metadata JSON if available */}
          {report.metadata && Object.keys(report.metadata).length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-xs font-semibold text-slate-200">Custom Metadata</span>
              <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono text-[11px] text-slate-300 overflow-x-auto">
                {JSON.stringify(report.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportDetail;
