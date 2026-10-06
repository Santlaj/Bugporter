import prisma from "../lib/prisma";

export const reportEventModel = {
  async bulkCreate(reportId, events = []) {
    if (!events || events.length === 0) return { count: 0 };

    const data = events.map((event) => ({
      reportId,
      type: event.type,
      payload: event.payload || event,
      timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
    }));

    return prisma.reportEvent.createMany({
      data,
    });
  },

  async findByReportId(reportId) {
    return prisma.reportEvent.findMany({
      where: { reportId },
      orderBy: { timestamp: "asc" },
    });
  },
};

export default reportEventModel;
