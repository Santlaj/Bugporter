import prisma from "../lib/prisma";

export const reportModel = {
  async findById(id) {
    return prisma.report.findUnique({
      where: { id },
      include: {
        screenshot: true,
        events: {
          orderBy: { timestamp: "asc" },
        },
        project: true,
      },
    });
  },

  async findManyByProjectId(projectId, filters = {}) {
    const { status, severity, search, limit = 50, offset = 0 } = filters;

    const where = {
      projectId,
      ...(status ? { status } : {}),
      ...(severity ? { severity } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          screenshot: true,
        },
      }),
      prisma.report.count({ where }),
    ]);

    return { reports, total };
  },

  async create(data) {
    return prisma.report.create({
      data,
    });
  },

  async updateStatus(id, status) {
    return prisma.report.update({
      where: { id },
      data: { status },
    });
  },

  async updateSeverity(id, severity) {
    return prisma.report.update({
      where: { id },
      data: { severity },
    });
  },
};

export default reportModel;
