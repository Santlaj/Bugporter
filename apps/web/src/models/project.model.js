import prisma from "../lib/prisma";

export const projectModel = {
  async findById(id) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        origins: true,
        apiKeys: true,
      },
    });
  },

  async findBySlug(organizationId, slug) {
    return prisma.project.findUnique({
      where: {
        organizationId_slug: { organizationId, slug },
      },
    });
  },

  async findManyByOrgId(organizationId) {
    return prisma.project.findMany({
      where: { organizationId },
      include: {
        origins: true,
        apiKeys: true,
        _count: {
          select: { reports: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async deleteDemoProjects() {
    try {
      const demoProjects = await prisma.project.findMany({
        where: {
          OR: [
            { slug: "study-center" },
            { name: "Study Center" },
          ],
        },
      });

      for (const p of demoProjects) {
        await prisma.project.delete({
          where: { id: p.id },
        });
      }
      return demoProjects.length;
    } catch (e) {
      console.warn("Could not delete demo project:", e.message);
      return 0;
    }
  },

  async create(data) {
    return prisma.project.create({
      data,
    });
  },

  async update(id, data) {
    return prisma.project.update({
      where: { id },
      data,
    });
  },

  async delete(id) {
    return prisma.project.delete({
      where: { id },
    });
  },
};

export default projectModel;
