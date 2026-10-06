import prisma from "../lib/prisma";

export const notificationModel = {
  async create(data) {
    return prisma.notification.create({
      data,
    });
  },

  async findByProjectId(projectId, limit = 50) {
    return prisma.notification.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  async updateStatus(id, status, error = null) {
    return prisma.notification.update({
      where: { id },
      data: { status, error },
    });
  },
};

export default notificationModel;
