import { projectModel, organizationModel } from "../models";
import { apiKeyController } from "./api-key.controller";
import { NotFoundError, ValidationError } from "../lib/errors";

export const projectController = {
  /**
   * Retrieves single project with related API keys and origins.
   */
  async getProject(projectId) {
    const project = await projectModel.findById(projectId);
    if (!project) {
      throw new NotFoundError("Project not found");
    }
    return project;
  },

  /**
   * Lists all projects belonging to the user's organization.
   */
  async listProjects(userId) {
    let orgs = await organizationModel.findByOwnerId(userId);
    if (!orgs || orgs.length === 0) {
      const newOrg = await organizationModel.create({
        name: "My Projects",
        slug: `workspace-${userId.slice(-6)}`,
        ownerId: userId,
      });
      orgs = [newOrg];
    }

    const organizationId = orgs[0].id;
    return projectModel.findManyByOrgId(organizationId);
  },

  /**
   * Creates a new project and automatically generates an initial public API key.
   */
  async createProject(userId, { name, slug }) {
    if (!name || name.trim().length === 0) {
      throw new ValidationError("Project name is required.");
    }

    let orgs = await organizationModel.findByOwnerId(userId);
    let organizationId;

    if (!orgs || orgs.length === 0) {
      const newOrg = await organizationModel.create({
        name: "My Projects",
        slug: `workspace-${userId.slice(-6)}`,
        ownerId: userId,
      });
      organizationId = newOrg.id;
    } else {
      organizationId = orgs[0].id;
    }

    const baseSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "project";

    let finalSlug = baseSlug;
    let counter = 1;
    while (await projectModel.findBySlug(organizationId, finalSlug)) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const project = await projectModel.create({
      organizationId,
      name: name.trim(),
      slug: finalSlug,
    });

    // Auto-generate initial public API key (pk_...)
    const apiKey = await apiKeyController.generateKey(project.id);

    return {
      ...project,
      apiKey: apiKey.publicKey,
    };
  },

  async updateProject(id, data) {
    return projectModel.update(id, data);
  },

  async deleteProject(id) {
    return projectModel.delete(id);
  },

  async removeDemoProject() {
    return projectModel.deleteDemoProjects();
  },
};

export default projectController;
