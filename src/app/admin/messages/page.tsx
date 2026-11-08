import { adminListMessages } from "@/lib/data";
import { AdminMessagesClient } from "./AdminMessagesClient";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const initialMessages = await adminListMessages().catch(() => []);
  return <AdminMessagesClient initialMessages={initialMessages as any} />;
}
