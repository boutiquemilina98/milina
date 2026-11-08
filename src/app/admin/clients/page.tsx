import { adminListCustomers } from "@/lib/data";
import { AdminCustomersClient } from "./AdminCustomersClient";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const initialCustomers = await adminListCustomers().catch(() => []);
  return <AdminCustomersClient initialCustomers={initialCustomers as any} />;
}
