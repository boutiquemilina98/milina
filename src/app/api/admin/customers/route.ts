import { db } from "@/db";
import { customers } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list = await db.select().from(customers).orderBy(desc(customers.createdAt));
    return Response.json({ customers: list });
  } catch (err) {
    return Response.json({ customers: [], error: String(err) }, { status: 500 });
  }
}