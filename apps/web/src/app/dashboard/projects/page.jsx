import { authController, projectController } from "@/controllers";
import { ProjectCard } from "@/views/components";
import { revalidatePath } from "next/cache";
import { FolderGit2, Plus, Globe, Sparkles } from "lucide-react";

async function createProjectAction(formData) {
  "use server";
  const name = formData.get("name");
  const websiteUrl = formData.get("websiteUrl");
  const user = await authController.getCurrentUser();

  const project = await projectController.createProject(user.id, { name });

  if (websiteUrl && websiteUrl.trim()) {
    try {
      const { originController } = await import("@/controllers");
      await originController.addOrigin(project.id, websiteUrl.trim());
    } catch (err) {
      console.warn("Could not register origin during project creation:", err.message);
    }
  }

  revalidatePath("/dashboard/projects");
}

async function deleteProjectAction(formData) {
  "use server";
  const projectId = formData.get("projectId");
  if (projectId) {
    await projectController.deleteProject(projectId);
    revalidatePath("/dashboard/projects");
  }
}

export default async function ProjectsPage() {
  // Purge any lingering demo project automatically
  try {
    await projectController.removeDemoProject();
  } catch {}

  let user = null;
  try {
    user = await authController.getCurrentUser();
  } catch {}

  let projects = [];
  try {
    if (user?.id) {
      projects = await projectController.listProjects(user.id);
    }
  } catch {
    projects = [];
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Title & Create Project Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Projects</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your websites and obtain integration keys for Bug Reporter
          </p>
        </div>

        {/* Create Project Form */}
        <form action={createProjectAction} className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            name="name"
            placeholder="Project name (e.g. My Portfolio)"
            required
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 min-w-[200px]"
          />
          <div className="relative">
            <input
              type="url"
              name="websiteUrl"
              placeholder="Deployed URL (optional, e.g. https://...)"
              className="pl-7 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 min-w-[240px]"
            />
            <Globe className="h-3.5 w-3.5 text-slate-500 absolute left-2 top-2.5" />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Project</span>
          </button>
        </form>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center space-y-4">
          <div className="h-12 w-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
            <FolderGit2 className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-200">No projects yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create your project above using your deployed website name to get your public API key and copy-paste snippet.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              deleteAction={deleteProjectAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}
