import { db } from "@/db";
import { settings, categories, products } from "@/db/schema";
import CheckoutClient from "./CheckoutClient";
import { WILAYAS } from "@/lib/format";

export default async function CommanderPage() {
  let shippingRates: Record<string, { home: number; desk: number }> = {};
  let whatsappNumber = "213660989407";
  let customOrderProductIds: number[] = [];
  let customOrderCatIds: number[] = [];
  
  try {
    const [settingsRows, categoryRows, productRows] = await Promise.all([
      db.select().from(settings),
      db.select().from(categories),
      db.select({ id: products.id, categoryId: products.categoryId }).from(products),
    ]);

    const shippingRow = settingsRows.find(r => r.key === "shippingRates");
    if (shippingRow && shippingRow.value) {
      shippingRates = shippingRow.value as Record<string, { home: number; desk: number }>;
    } else {
      WILAYAS.forEach(w => {
        shippingRates[w] = { home: 0, desk: 0 };
      });
    }

    const waRow = settingsRows.find(r => r.key === "whatsapp_number");
    if (waRow && waRow.value && typeof waRow.value === "string" && waRow.value.trim().length > 0) {
      whatsappNumber = waRow.value.trim();
    }

    customOrderCatIds = categoryRows
      .filter(c => (c.slug && c.slug.toLowerCase().includes("commande")) || (c.name && c.name.toLowerCase().includes("commande")))
      .map(c => c.id);

    if (customOrderCatIds.length > 0) {
      customOrderProductIds = productRows
        .filter(p => p.categoryId && customOrderCatIds.includes(p.categoryId))
        .map(p => p.id);
    }
  } catch {
    WILAYAS.forEach(w => {
      shippingRates[w] = { home: 0, desk: 0 };
    });
  }

  return (
    <CheckoutClient
      shippingRates={shippingRates}
      whatsappNumber={whatsappNumber}
      customOrderProductIds={customOrderProductIds}
      customOrderCatIds={customOrderCatIds}
    />
  );
}
