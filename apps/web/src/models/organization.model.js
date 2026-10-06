import prisma from "../lib/prisma";

export const organizationModel = {
  async findById(id) {
    return prisma.organization.findUnique({
      where: { id },
    });
  },

  async findBySlug(slug) {
    return prisma.organization.findUnique({
      where: { slug },
    });
  },

  async findByOwnerId(ownerId) {
    return prisma.organization.findMany({
      where: { ownerId },
    });
  },

  async create(data) {
    return prisma.organization.create({
      data,
    });
  },
};

export default organizationModel;
