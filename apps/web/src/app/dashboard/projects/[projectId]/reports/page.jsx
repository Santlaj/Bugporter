import Link from "next/link";
import { projectController, reportController } from "@/controllers";
import { ReportCard, FilterBar, InstallSnippet } from "@/views/components";
import { ArrowLeft, Settings, ShieldCheck, Bug } from "lucide-react";

export default async function ProjectReportsPage({ params, searchParams }) {
  const { projectId } = params;
  const project = await projectController.getProject(projectId);

  const filters = {
    status: searchParams?.status,
    severity: searchParams?.severity,
    search: searchParams?.search,
  };

  const { reports, total } = await reportController.listReports(projectId, filters);
  const activeKey = project.apiKeys?.find((k) => k.status === "ACTIVE")?.publicKey || "";

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Navigation & Header */}
      <div>
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>All Projects</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">{project.name}</h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              /{project.slug} • {total} total bug report{total === 1 ? "" : "s"}
            </p>
          </div>

          <Link
            href={`/dashboard/projects/${projectId}/settings`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Project Settings</span>
          </Link>
        </div>
      </div>

      {/* Embed snippet card */}
      <InstallSnippet apiKey={activeKey} />

      {/* Filter Bar */}
      <FilterBar filters={filters} totalCount={total} />

      {/* Reports Feed */}
      {reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center space-y-3">
          <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
            <Bug className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">No bug reports matching filters</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            When users submit issues using the embedded widget, reports will appear here in real-time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}
