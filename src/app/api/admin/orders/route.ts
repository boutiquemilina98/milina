import { adminListOrders } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list = await adminListOrders();
    return Response.json({ ok: true, orders: list });
  } catch (err) {
    return Response.json({ ok: false, orders: [], error: String(err) }, { status: 500 });
  }
}
