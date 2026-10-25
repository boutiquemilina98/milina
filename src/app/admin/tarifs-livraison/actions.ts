"use server";

import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getShippingRates() {
  const row = await db.select().from(settings).where(eq(settings.key, "shippingRates")).limit(1);
  if (row.length === 0) {
    return {};
  }
  return row[0].value as Record<string, { home: number; desk: number }>;
}

export async function saveShippingRates(rates: Record<string, { home: number; desk: number }>) {
  const row = await db.select().from(settings).where(eq(settings.key, "shippingRates")).limit(1);
  if (row.length === 0) {
    await db.insert(settings).values({ key: "shippingRates", value: rates });
  } else {
    await db.update(settings).set({ value: rates, updatedAt: new Date() }).where(eq(settings.key, "shippingRates"));
  }
  revalidatePath("/admin/tarifs-livraison");
  revalidatePath("/commander");
  return { success: true };
}
