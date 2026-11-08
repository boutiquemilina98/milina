import { adminListProducts } from "@/lib/data";
import { AdminProductsClient } from "./AdminProductsClient";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const initialProducts = await adminListProducts().catch(() => []);
  return <AdminProductsClient initialProducts={initialProducts} />;
}
