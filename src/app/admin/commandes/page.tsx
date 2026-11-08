import { adminListOrders } from "@/lib/data";
import { AdminOrdersClient } from "./AdminOrdersClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const initialOrders = await adminListOrders().catch(() => []);
  return <AdminOrdersClient initialOrders={initialOrders} />;
}
