import { NextRequest } from "next/server";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { sendContactMessageEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, message } = body ?? {};

    if (!name || !email || !message) {
      return Response.json(
        { ok: false, error: "Nom, email et message sont obligatoires." },
        { status: 400 }
      );
    }

    // 1. Insert message into database
    const [inserted] = await db
      .insert(contactMessages)
      .values({
        name: String(name).trim().slice(0, 160),
        email: String(email).trim().slice(0, 200),
        phone: phone ? String(phone).trim().slice(0, 32) : null,
        message: String(message).trim(),
        isRead: false,
      })
      .returning();

    // 2. Send email via Resend
    try {
      await sendContactMessageEmail({
        name: inserted.name,
        email: inserted.email,
        phone: inserted.phone || undefined,
        message: inserted.message,
      });
    } catch (emailErr) {
      console.error("[Contact API] Error sending email via Resend:", emailErr);
    }

    return Response.json({
      ok: true,
      messageId: inserted.id,
    });
  } catch (err) {
    console.error("[Contact API] Error processing message:", err);
    return Response.json(
      { ok: false, error: "Une erreur est survenue lors de l'envoi." },
      { status: 500 }
    );
  }
}
