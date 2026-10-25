import { getCategories } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await getCategories();
    return Response.json({ categories });
  } catch (err) {
    return Response.json({ categories: [], error: String(err) }, { status: 500 });
  }
}