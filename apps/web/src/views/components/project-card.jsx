"use client";

import { useState } from "react";
import Link from "next/link";
import { FolderGit2, ArrowRight, ShieldCheck, Key, Copy, Check, Trash2, Code2 } from "lucide-react";
import { InstallSnippet } from "./install-snippet";

export function ProjectCard({ project, deleteAction }) {
  const [copiedKey, setCopiedKey] = useState(false);
  const [showSnippet, setShowSnippet] = useState(false);

  const activeKey = project.apiKeys?.find((k) => k.status === "ACTIVE")?.publicKey || "No key issued";
  const originsCount = project.origins?.length || 0;
  const reportsCount = project._count?.reports || 0;

  const copyKey = () => {
    if (navigator?.clipboard && activeKey !== "No key issued") {
      navigator.clipboard.writeText(activeKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 hover:border-slate-700/80 hover:bg-slate-900/80 transition-all flex flex-col justify-between group shadow-lg">
      <div className="space-y-4">
        {/* Top Header: Icon & Public Key */}
        <div className="flex items-center justify-between gap-2">
          <div className="h-10 w-10 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600/20 transition">
            <FolderGit2 className="h-5 w-5" />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={copyKey}
              title="Click to copy full public API key"
              className="text-[11px] font-mono text-slate-300 bg-slate-800/90 hover:bg-slate-700 px-2.5 py-1 rounded-md border border-slate-700/80 flex items-center gap-1.5 transition"
            >
              <Key className="h-3 w-3 text-indigo-400" />
              <span>{activeKey.slice(0, 10)}...</span>
              {copiedKey ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-slate-400" />}
            </button>

            {deleteAction && (
              <form action={deleteAction} onSubmit={(e) => {
                if (!confirm(`Are you sure you want to delete "${project.name}"? All reports will be removed.`)) {
                  e.preventDefault();
                }
              }}>
                <input type="hidden" name="projectId" value={project.id} />
                <button
                  type="submit"
                  title="Delete project"
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Project Name & Slug */}
        <div>
          <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition">
            {project.name}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">/{project.slug}</p>
        </div>

        {/* Badges / Metrics */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            {originsCount === 0 ? "All origins allowed" : `${originsCount} origin${originsCount === 1 ? "" : "s"}`}
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300 font-medium">
            {reportsCount} {reportsCount === 1 ? "report" : "reports"}
          </span>
        </div>

        {/* Toggle snippet button */}
        <div>
          <button
            onClick={() => setShowSnippet(!showSnippet)}
            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition"
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>{showSnippet ? "Hide Integration Snippet" : "Get Integration Snippet"}</span>
          </button>
        </div>

        {showSnippet && (
          <div className="mt-2">
            <InstallSnippet apiKey={activeKey} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Created {new Date(project.createdAt).toLocaleDateString()}
        </span>
        <Link
          href={`/dashboard/projects/${project.id}/reports`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
        >
          <span>View Reports</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default ProjectCard;
