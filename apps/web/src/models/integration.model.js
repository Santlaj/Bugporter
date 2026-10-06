import prisma from "../lib/prisma";

export const integrationModel = {
  async findByProjectId(projectId) {
    return prisma.integration.findMany({
      where: { projectId },
    });
  },

  async findByType(projectId, type) {
    return prisma.integration.findUnique({
      where: {
        projectId_type: { projectId, type },
      },
    });
  },

  async upsert(projectId, type, config, enabled = true) {
    return prisma.integration.upsert({
      where: {
        projectId_type: { projectId, type },
      },
      create: { projectId, type, config, enabled },
      update: { config, enabled },
    });
  },

  async delete(projectId, type) {
    return prisma.integration.delete({
      where: {
        projectId_type: { projectId, type },
      },
    });
  },
};

export default integrationModel;
