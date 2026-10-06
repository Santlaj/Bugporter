import prisma from "../lib/prisma";

export const reportScreenshotModel = {
  async findByReportId(reportId) {
    return prisma.reportScreenshot.findUnique({
      where: { reportId },
    });
  },

  async create(data) {
    return prisma.reportScreenshot.create({
      data,
    });
  },

  async upsert(reportId, data) {
    return prisma.reportScreenshot.upsert({
      where: { reportId },
      create: { ...data, reportId },
      update: data,
    });
  },
};

export default reportScreenshotModel;
