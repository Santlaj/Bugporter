import prisma from "../lib/prisma";

export const githubInstallationModel = {
  async findByProjectId(projectId) {
    return prisma.githubInstallation.findUnique({
      where: { projectId },
    });
  },

  async upsert(projectId, data) {
    return prisma.githubInstallation.upsert({
      where: { projectId },
      create: { ...data, projectId },
      update: data,
    });
  },

  async delete(projectId) {
    return prisma.githubInstallation.delete({
      where: { projectId },
    });
  },
};

export default githubInstallationModel;
