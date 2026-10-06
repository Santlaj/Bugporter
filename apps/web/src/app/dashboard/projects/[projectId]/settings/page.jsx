import Link from "next/link";
import { projectController, originController, apiKeyController } from "@/controllers";
import { InstallSnippet } from "@/views/components";
import { revalidatePath } from "next/cache";
import { ArrowLeft, Plus, Trash2, Key, Shield, Globe } from "lucide-react";

async function addOriginAction(projectId, formData) {
  "use server";
  const origin = formData.get("origin");
  if (origin) {
    await originController.addOrigin(projectId, origin);
    revalidatePath(`/dashboard/projects/${projectId}/settings`);
  }
}

async function removeOriginAction(projectId, originId) {
  "use server";
  await originController.removeOrigin(originId);
  revalidatePath(`/dashboard/projects/${projectId}/settings`);
}

async function generateKeyAction(projectId) {
  "use server";
  await apiKeyController.generateKey(projectId);
  revalidatePath(`/dashboard/projects/${projectId}/settings`);
}

async function revokeKeyAction(projectId, keyId) {
  "use server";
  await apiKeyController.revokeKey(keyId);
  revalidatePath(`/dashboard/projects/${projectId}/settings`);
}

export default async function ProjectSettingsPage({ params }) {
  const { projectId } = params;
  const project = await projectController.getProject(projectId);
  const origins = await originController.listOrigins(projectId);
  const apiKeys = await apiKeyController.listKeys(projectId);

  const activeKey = apiKeys.find((k) => k.status === "ACTIVE")?.publicKey || "";

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      <div>
        <Link
          href={`/dashboard/projects/${projectId}/reports`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Project Reports</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-white">{project.name} • Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure security allowlists, origin domains, and public API keys.
        </p>
      </div>

      {/* Embed snippet card */}
      <InstallSnippet apiKey={activeKey} />

      {/* Origin Allowlist Section */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-indigo-400" />
          <div>
            <h3 className="text-sm font-semibold text-white">Allowed Origins</h3>
            <p className="text-xs text-slate-400">
              Restrict where bug reports can be submitted from. Leave empty to allow all origins during onboarding.
            </p>
          </div>
        </div>

        {/* Add Origin Form */}
        <form action={addOriginAction.bind(null, projectId)} className="flex gap-2">
          <input
            type="url"
            name="origin"
            placeholder="https://example.com"
            required
            className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Origin</span>
          </button>
        </form>

        {/* Origins List */}
        <div className="divide-y divide-slate-800/80 border-t border-slate-800/80 pt-2">
          {origins.length === 0 ? (
            <p className="py-3 text-xs text-slate-500 italic">
              No origins configured. All origins (including localhost) are currently allowed.
            </p>
          ) : (
            origins.map((origin) => (
              <div key={origin.id} className="py-2.5 flex items-center justify-between">
                <span className="font-mono text-xs text-slate-300">{origin.origin}</span>
                <form action={removeOriginAction.bind(null, projectId, origin.id)}>
                  <button
                    type="submit"
                    className="text-slate-500 hover:text-red-400 p-1.5 transition"
                    title="Remove origin"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            ))
          )}
        </div>
      </div>

      {/* API Keys Section */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">Public Project Keys</h3>
              <p className="text-xs text-slate-400">
                Identifier used in the SDK snippet. Safe to expose publicly in client code.
              </p>
            </div>
          </div>

          <form action={generateKeyAction.bind(null, projectId)}>
            <button
              type="submit"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center gap-1.5 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Rotate / Create New Key</span>
            </button>
          </form>
        </div>

        <div className="divide-y divide-slate-800/80 border-t border-slate-800/80 pt-2">
          {apiKeys.map((key) => {
            const isActive = key.status === "ACTIVE";
            return (
              <div key={key.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs text-indigo-300 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                    {key.publicKey}
                  </span>
                  <span
                    className={`ml-2 text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                      isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {key.status}
                  </span>
                </div>

                {isActive && (
                  <form action={revokeKeyAction.bind(null, projectId, key.id)}>
                    <button
                      type="submit"
                      className="text-xs text-red-400 hover:text-red-300 font-medium transition"
                    >
                      Revoke
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
