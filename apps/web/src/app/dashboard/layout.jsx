import { redirect } from "next/navigation";
import { DashboardLayout } from "@/views/layouts";
import { authController } from "@/controllers";

export default async function Layout({ children }) {
  let user = null;
  try {
    user = await authController.getCurrentUser();
  } catch {}

  if (!user) {
    redirect("/login");
  }

  return <DashboardLayout user={user}>{children}</DashboardLayout>;
}
