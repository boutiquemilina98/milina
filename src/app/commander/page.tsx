import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import CheckoutClient from "./CheckoutClient";
import { WILAYAS } from "@/lib/format";



export default async function CommanderPage() {
  let shippingRates: Record<string, { home: number; desk: number }> = {};
  let whatsappNumber = "213660989407";
  
  try {
    const rows = await db.select().from(settings);
    const shippingRow = rows.find(r => r.key === "shippingRates");
    if (shippingRow && shippingRow.value) {
      shippingRates = shippingRow.value as Record<string, { home: number; desk: number }>;
    } else {
      WILAYAS.forEach(w => {
        shippingRates[w] = { home: 0, desk: 0 };
      });
    }

    const waRow = rows.find(r => r.key === "whatsapp_number");
    if (waRow && waRow.value && typeof waRow.value === "string" && waRow.value.trim().length > 0) {
      whatsappNumber = waRow.value.trim();
    }
  } catch {
    WILAYAS.forEach(w => {
      shippingRates[w] = { home: 0, desk: 0 };
    });
  }

  return <CheckoutClient shippingRates={shippingRates} whatsappNumber={whatsappNumber} />;
}
