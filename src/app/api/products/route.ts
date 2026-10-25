import { NextRequest } from "next/server";
import { getProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") ?? undefined;
    const search = searchParams.get("search") ?? undefined;
    const featured = searchParams.get("featured");
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : undefined;

    const products = await getProducts({
      category,
      search,
      featured: featured === "true" ? true : featured === "false" ? false : undefined,
      limit,
    });
    return Response.json({ products });
  } catch (err) {
    return Response.json({ products: [], error: String(err) }, { status: 500 });
  }
}