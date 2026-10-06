import { authController, projectController, githubController, telegramController } from "@/controllers";
import { integrationModel } from "@/models";
import { revalidatePath } from "next/cache";
import { Shield, Github, Send, Mail, CheckCircle2, AlertCircle } from "lucide-react";

async function saveTelegramAction(projectId, formData) {
  "use server";
  const botToken = formData.get("botToken");
  const chatId = formData.get("chatId");
  const topicId = formData.get("topicId");

  await telegramController.configureTelegram(projectId, {
    botToken,
    chatId,
    topicId,
  });
  revalidatePath("/dashboard/integrations");
}

async function disableTelegramAction(projectId) {
  "use server";
  await telegramController.disableTelegram(projectId);
  revalidatePath("/dashboard/integrations");
}

async function saveEmailAction(projectId, formData) {
  "use server";
  const email = formData.get("email");
  await integrationModel.upsert(projectId, "EMAIL", { email }, true);
  revalidatePath("/dashboard/integrations");
}

async function disableEmailAction(projectId) {
  "use server";
  await integrationModel.delete(projectId, "EMAIL");
  revalidatePath("/dashboard/integrations");
}

async function saveGithubAction(projectId, formData) {
  "use server";
  const targetRepo = formData.get("targetRepo");
  const installationId = formData.get("installationId") || "12345678";
  const accountLogin = targetRepo.split("/")[0] || "org";

  await githubController.saveInstallation(projectId, installationId, accountLogin, targetRepo);
  revalidatePath("/dashboard/integrations");
}

async function disableGithubAction(projectId) {
  "use server";
  await githubController.removeInstallation(projectId);
  revalidatePath("/dashboard/integrations");
}

export default async function IntegrationsPage({ searchParams }) {
  let user = null;
  try {
    user = await authController.getCurrentUser();
  } catch {}

  const projects = await projectController.listProjects(user?.id || "demo-dev");
  const selectedProjectId = searchParams?.projectId || projects[0]?.id;

  if (!selectedProjectId) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-slate-400">
        <Shield className="h-10 w-10 text-slate-600 mx-auto mb-3" />
        <h2 className="text-base font-semibold text-white">No projects found</h2>
        <p className="text-xs text-slate-500 mt-1">Please create a project first before configuring integrations.</p>
      </div>
    );
  }

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const [githubInstall, telegramIntegration, emailIntegration] = await Promise.all([
    githubController.getInstallation(selectedProject.id),
    telegramController.getIntegration(selectedProject.id),
    integrationModel.findByType(selectedProject.id, "EMAIL"),
  ]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Integrations</h1>
        <p className="text-xs text-slate-400 mt-1">
          Automate developer workflows by connecting GitHub, Telegram, and Email alerts.
        </p>
      </div>

      {/* Project Selector Bar */}
      <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
        <span className="text-slate-400 font-medium">Configuring for project:</span>
        <span className="font-semibold text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
          {selectedProject.name}
        </span>
      </div>

      {/* Integration Cards */}
      <div className="space-y-6">
        {/* 1. GitHub App Integration */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center text-white">
                <Github className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">GitHub Issues</h3>
                <p className="text-xs text-slate-400">
                  Turns bug reports into ready-to-fix GitHub issues with screenshots, breadcrumbs, and logs.
                </p>
              </div>
            </div>

            {githubInstall ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Connected
              </span>
            ) : (
              <span className="text-xs text-slate-500">Not configured</span>
            )}
          </div>

          <form action={saveGithubAction.bind(null, selectedProject.id)} className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="github-repo">
                Target Repository (owner/repo)
              </label>
              <input
                id="github-repo"
                name="targetRepo"
                type="text"
                defaultValue={githubInstall?.targetRepo || ""}
                placeholder="acme/web-frontend"
                required
                className="w-full max-w-md px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition"
              >
                Save GitHub Target
              </button>
              {githubInstall && (
                <button
                  type="submit"
                  formAction={disableGithubAction.bind(null, selectedProject.id)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-red-400 text-xs font-medium rounded-lg transition"
                >
                  Disconnect
                </button>
              )}
            </div>
          </form>
        </div>

        {/* 2. Telegram Bot Integration */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Telegram Alerts</h3>
                <p className="text-xs text-slate-400">
                  Sends instant notifications directly to your developer chat or group thread.
                </p>
              </div>
            </div>

            {telegramIntegration?.enabled ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Active
              </span>
            ) : (
              <span className="text-xs text-slate-500">Not configured</span>
            )}
          </div>

          <form action={saveTelegramAction.bind(null, selectedProject.id)} className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="telegram-token">
                  Bot Token
                </label>
                <input
                  id="telegram-token"
                  name="botToken"
                  type="password"
                  defaultValue={telegramIntegration?.config?.botToken || ""}
                  placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="telegram-chat-id">
                  Chat ID
                </label>
                <input
                  id="telegram-chat-id"
                  name="chatId"
                  type="text"
                  defaultValue={telegramIntegration?.config?.chatId || ""}
                  placeholder="-1001234567890"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition"
              >
                Save Telegram Config
              </button>
              {telegramIntegration && (
                <button
                  type="submit"
                  formAction={disableTelegramAction.bind(null, selectedProject.id)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-red-400 text-xs font-medium rounded-lg transition"
                >
                  Disconnect
                </button>
              )}
            </div>
          </form>
        </div>

        {/* 3. Email Alerts Integration */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Email Digest & Alerts</h3>
                <p className="text-xs text-slate-400">
                  Sends an email summary whenever a new bug report or critical P0 is submitted.
                </p>
              </div>
            </div>

            {emailIntegration?.enabled ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Active
              </span>
            ) : (
              <span className="text-xs text-slate-500">Not configured</span>
            )}
          </div>

          <form action={saveEmailAction.bind(null, selectedProject.id)} className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="alert-email">
                Recipient Email
              </label>
              <input
                id="alert-email"
                name="email"
                type="email"
                defaultValue={emailIntegration?.config?.email || ""}
                placeholder="dev-alerts@company.com"
                required
                className="w-full max-w-md px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition"
              >
                Save Email Alerts
              </button>
              {emailIntegration && (
                <button
                  type="submit"
                  formAction={disableEmailAction.bind(null, selectedProject.id)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-red-400 text-xs font-medium rounded-lg transition"
                >
                  Disconnect
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
