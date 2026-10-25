import { NextRequest } from "next/server";
import { db } from "@/db";
import { orders, customers } from "@/db/schema";
import { adminListOrders } from "@/lib/data";
import { eq, sql, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list = await adminListOrders();
    return Response.json({ orders: list });
  } catch (err) {
    return Response.json({ orders: [], error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      wilaya,
      commune,
      address,
      notes,
      items,
      subtotal,
      shipping,
      total,
      paymentMethod,
    } = body ?? {};

    if (
      !customerName ||
      !customerPhone ||
      !wilaya ||
      !commune ||
      !address ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return Response.json(
        { ok: false, error: "Champs requis manquants" },
        { status: 400 }
      );
    }

    const lastOrder = await db
      .select({ id: orders.id })
      .from(orders)
      .orderBy(desc(orders.id))
      .limit(1);
    
    const nextId = (lastOrder[0]?.id || 0) + 1;
    const orderNumber = `N${nextId.toString().padStart(2, "0")}`;

    const [inserted] = await db
      .insert(orders)
      .values({
        orderNumber,
        customerName,
        customerPhone,
        customerEmail: customerEmail ?? null,
        wilaya,
        commune,
        address,
        notes: notes ?? null,
        items,
        subtotal: String(subtotal ?? 0),
        shipping: String(shipping ?? 0),
        total: String(total ?? 0),
        status: "pending",
        paymentMethod: paymentMethod ?? "cod",
      })
      .returning();

    // Upsert customer record
    const existingCustomer = await db
      .select()
      .from(customers)
      .where(eq(customers.phone, customerPhone))
      .limit(1);

    if (existingCustomer.length === 0) {
      await db.insert(customers).values({
        name: customerName,
        phone: customerPhone,
        email: customerEmail ?? null,
        wilaya,
        totalOrders: 1,
        totalSpent: String(total ?? 0),
      });
    } else {
      await db
        .update(customers)
        .set({
          totalOrders: (existingCustomer[0].totalOrders ?? 0) + 1,
          totalSpent: String(
            parseFloat(existingCustomer[0].totalSpent ?? "0") +
              parseFloat(String(total ?? 0))
          ),
        })
        .where(eq(customers.phone, customerPhone));
    }

    return Response.json({
      ok: true,
      orderNumber: inserted.orderNumber,
      orderId: inserted.id,
    });
  } catch (err) {
    return Response.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}