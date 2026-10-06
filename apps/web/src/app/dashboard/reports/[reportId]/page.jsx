import { reportController } from "@/controllers";
import { ReportDetail } from "@/views/components";
import { revalidatePath } from "next/cache";

async function updateStatusAction(reportId, status) {
  "use server";
  await reportController.updateStatus(reportId, status);
  revalidatePath(`/dashboard/reports/${reportId}`);
}

async function updateSeverityAction(reportId, severity) {
  "use server";
  await reportController.updateSeverity(reportId, severity);
  revalidatePath(`/dashboard/reports/${reportId}`);
}

export default async function ReportDetailPage({ params }) {
  const { reportId } = params;
  const report = await reportController.getReportDetail(reportId);

  return (
    <ReportDetail
      report={report}
      onStatusChange={updateStatusAction}
      onSeverityChange={updateSeverityAction}
    />
  );
}
