import { adminListCategories } from "@/lib/data";
import { AdminCategoriesClient } from "./AdminCategoriesClient";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const initialCategories = await adminListCategories().catch(() => []);
  return <AdminCategoriesClient initialCategories={initialCategories} />;
}
