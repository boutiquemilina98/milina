import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list = await db
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt));
    return Response.json({ messages: list });
  } catch (err) {
    return Response.json({ messages: [], error: String(err) }, { status: 500 });
  }
}