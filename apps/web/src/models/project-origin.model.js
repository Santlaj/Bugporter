import prisma from "../lib/prisma";

export const projectOriginModel = {
  async findByProjectId(projectId) {
    return prisma.projectOrigin.findMany({
      where: { projectId },
    });
  },

  async findByProjectAndOrigin(projectId, origin) {
    return prisma.projectOrigin.findUnique({
      where: {
        projectId_origin: { projectId, origin },
      },
    });
  },

  async create(data) {
    return prisma.projectOrigin.create({
      data,
    });
  },

  async delete(id) {
    return prisma.projectOrigin.delete({
      where: { id },
    });
  },
};

export default projectOriginModel;
