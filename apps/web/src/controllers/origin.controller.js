import { projectOriginModel } from "../models";
import { ForbiddenError } from "../lib/errors";

export const originController = {
  async addOrigin(projectId, origin) {
    const normalized = new URL(origin).origin;
    return projectOriginModel.create({
      projectId,
      origin: normalized,
    });
  },

  async listOrigins(projectId) {
    return projectOriginModel.findByProjectId(projectId);
  },

  async removeOrigin(id) {
    return projectOriginModel.delete(id);
  },

  /**
   * Verifies whether an origin is in the project's allowed origins list.
   * If no origins configured, allows localhost/preview or returns allowed based on policy.
   */
  async validateOrigin(projectId, requestOrigin) {
    if (!requestOrigin) return true; // Direct non-browser or null origin handled per security rules

    const origins = await projectOriginModel.findByProjectId(projectId);
    // If no origins registered yet, default to allowing all (onboarding state)
    if (origins.length === 0) return true;

    const normalizedReq = new URL(requestOrigin).origin;
    const match = origins.some((o) => o.origin === normalizedReq);

    if (!match) {
      throw new ForbiddenError(`Origin '${requestOrigin}' is not authorized for this project`);
    }

    return true;
  },
};

export default originController;
