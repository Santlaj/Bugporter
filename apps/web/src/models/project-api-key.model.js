import prisma from "../lib/prisma";

export const projectApiKeyModel = {
  async findByPublicKey(publicKey) {
    return prisma.projectApiKey.findUnique({
      where: { publicKey },
      include: {
        project: {
          include: {
            origins: true,
          },
        },
      },
    });
  },

  async findByProjectId(projectId) {
    return prisma.projectApiKey.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });
  },

  async create(data) {
    return prisma.projectApiKey.create({
      data,
    });
  },

  async revoke(id) {
    return prisma.projectApiKey.update({
      where: { id },
      data: {
        status: "REVOKED",
        revokedAt: new Date(),
      },
    });
  },
};

export default projectApiKeyModel;
