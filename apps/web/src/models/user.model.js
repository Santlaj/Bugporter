import prisma from "../lib/prisma";

export const userModel = {
  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async create(data) {
    return prisma.user.create({
      data,
    });
  },

  async update(id, data) {
    return prisma.user.update({
      where: { id },
      data,
    });
  },
};

export default userModel;
