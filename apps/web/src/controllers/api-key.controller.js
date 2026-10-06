import crypto from "crypto";
import { projectApiKeyModel } from "../models";

export const apiKeyController = {
  async generateKey(projectId) {
    const randomHex = crypto.randomBytes(16).toString("hex");
    const publicKey = `pk_${randomHex}`;

    return projectApiKeyModel.create({
      projectId,
      publicKey,
    });
  },

  async revokeKey(id) {
    return projectApiKeyModel.revoke(id);
  },

  async listKeys(projectId) {
    return projectApiKeyModel.findByProjectId(projectId);
  },
};

export default apiKeyController;
