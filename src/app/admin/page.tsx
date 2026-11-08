import { adminStats } from "@/lib/data";
import { AdminDashboardClient } from "./AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const initialData = await adminStats().catch(() => null);
  return <AdminDashboardClient initialData={initialData} />;
}
