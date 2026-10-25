import { adminStats } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await adminStats();
    return Response.json(stats);
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}