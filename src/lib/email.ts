import { Resend } from "resend";
import { db } from "@/db";
import { settings } from "@/db/schema";

async function getEmailConfig() {
  let apiKey = process.env.RESEND_API_KEY;
  let notificationEmail = process.env.NOTIFICATION_EMAIL;

  // If missing from environment variables, fetch from database settings
  if (!apiKey || !notificationEmail) {
    try {
      const rows = await db.select().from(settings);
      for (const row of rows) {
        if (!apiKey && row.key === "resend_api_key") {
          apiKey = typeof row.value === "string" ? row.value : String(row.value ?? "");
        }
        if (!notificationEmail && (row.key === "notification_email" || row.key === "contact_email")) {
          notificationEmail = typeof row.value === "string" ? row.value : String(row.value ?? "");
        }
      }
    } catch (dbErr) {
      console.warn("[Email Config] Could not query settings table:", dbErr);
    }
  }

  if (!apiKey) {
    console.warn("[Email Config] No Resend API key found in env or database settings.");
    return null;
  }
  if (!notificationEmail) {
    notificationEmail = "boutiquemilina98@gmail.com";
  }

  const resendInstance = new Resend(apiKey);
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Boutique Milina <onboarding@resend.dev>";

  return {
    resend: resendInstance,
    notificationEmail,
    fromEmail,
  };
}

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  wilaya: string;
  commune: string;
  address: string;
  notes?: string | null;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
  }>;
  subtotal: number | string;
  shipping: number | string;
  total: number | string;
  paymentMethod?: string;
}

export async function sendOrderNotificationEmail(order: OrderEmailData) {
  try {
    const config = await getEmailConfig();
    if (!config) {
      console.warn("[Resend] Resend API key not configured, skipping order email.");
      return { ok: false, error: "RESEND_API_KEY is not configured" };
    }
    const { resend, notificationEmail, fromEmail } = config;

    const itemsHtml = (order.items || [])
      .map(
        (item) => `
        <tr style="border-bottom: 1px solid #f0f0f0;">
          <td style="padding: 10px 0; font-size: 14px; color: #111;">
            <strong>${item.name}</strong>
            ${item.size || item.color ? `<div style="font-size: 12px; color: #777;">Taille: ${item.size || "-"} | Couleur: ${item.color || "-"}</div>` : ""}
          </td>
          <td style="padding: 10px 8px; font-size: 14px; text-align: center; color: #444;">${item.quantity}</td>
          <td style="padding: 10px 0; font-size: 14px; text-align: right; color: #111; font-weight: 600;">${Number(item.price).toLocaleString("fr-DZ")} DA</td>
        </tr>
      `
      )
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Nouvelle commande ${order.orderNumber}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f7f8; margin: 0; padding: 24px; color: #111;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #eaeaea; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
            
            <div style="background-color: #000000; color: #ffffff; padding: 24px 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 20px; letter-spacing: 3px; font-weight: 700; text-transform: uppercase;">BOUTIQUE MILINA</h1>
              <p style="margin: 8px 0 0 0; font-size: 13px; color: #d1d1d1; letter-spacing: 1px;">Nouvelle Commande Reçue</p>
            </div>

            <div style="padding: 32px;">
              <div style="background-color: #f9f9fa; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
                <div style="font-size: 12px; color: #777; text-transform: uppercase; letter-spacing: 0.5px;">Numéro de commande</div>
                <div style="font-size: 22px; font-weight: 800; color: #000; margin-top: 2px;">#${order.orderNumber}</div>
                <div style="font-size: 18px; font-weight: 800; color: #000; margin-top: 8px; border-top: 1px solid #eee; padding-top: 8px;">Montant Total: ${Number(order.total).toLocaleString("fr-DZ")} DA</div>
              </div>

              <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-top: 0; margin-bottom: 12px; border-bottom: 2px solid #000; padding-bottom: 6px;">Informations Client</h3>
              <table style="width: 100%; font-size: 14px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 4px 0; color: #777; width: 140px;">Client:</td>
                  <td style="padding: 4px 0; font-weight: 600; color: #111;">${order.customerName}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #777;">Téléphone:</td>
                  <td style="padding: 4px 0; font-weight: 600; color: #111;"><a href="tel:${order.customerPhone}" style="color: #000; text-decoration: underline;">${order.customerPhone}</a></td>
                </tr>
                ${
                  order.customerEmail
                    ? `<tr>
                        <td style="padding: 4px 0; color: #777;">Email:</td>
                        <td style="padding: 4px 0; font-weight: 600; color: #111;"><a href="mailto:${order.customerEmail}" style="color: #000; text-decoration: underline;">${order.customerEmail}</a></td>
                      </tr>`
                    : ""
                }
                <tr>
                  <td style="padding: 4px 0; color: #777;">Wilaya / Commune:</td>
                  <td style="padding: 4px 0; font-weight: 600; color: #111;">${order.wilaya} — ${order.commune}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #777;">Adresse:</td>
                  <td style="padding: 4px 0; font-weight: 600; color: #111;">${order.address}</td>
                </tr>
                ${
                  order.notes
                    ? `<tr>
                        <td style="padding: 4px 0; color: #777;">Notes:</td>
                        <td style="padding: 4px 0; font-style: italic; color: #333;">${order.notes}</td>
                      </tr>`
                    : ""
                }
              </table>

              <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; border-bottom: 2px solid #000; padding-bottom: 6px;">Articles Commandés</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                  <tr style="border-bottom: 1px solid #ddd;">
                    <th style="text-align: left; padding-bottom: 8px; font-size: 12px; color: #777; text-transform: uppercase;">Article</th>
                    <th style="text-align: center; padding-bottom: 8px; font-size: 12px; color: #777; text-transform: uppercase; width: 60px;">Qté</th>
                    <th style="text-align: right; padding-bottom: 8px; font-size: 12px; color: #777; text-transform: uppercase; width: 100px;">Prix</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div style="background-color: #fafafa; border-radius: 8px; padding: 16px; margin-top: 16px;">
                <div style="display: flex; justify-content: space-between; font-size: 13px; color: #555; margin-bottom: 6px;">
                  <span>Sous-total:</span>
                  <span>${Number(order.subtotal).toLocaleString("fr-DZ")} DA</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 13px; color: #555; margin-bottom: 10px;">
                  <span>Livraison:</span>
                  <span>${Number(order.shipping).toLocaleString("fr-DZ")} DA</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; color: #000; border-top: 1px solid #e0e0e0; padding-top: 10px;">
                  <span>TOTAL:</span>
                  <span>${Number(order.total).toLocaleString("fr-DZ")} DA</span>
                </div>
              </div>
            </div>

            <div style="background-color: #f5f5f5; border-top: 1px solid #eaeaea; padding: 16px; text-align: center; font-size: 11px; color: #888;">
              © ${new Date().getFullYear()} Boutique Milina · Notification automatique
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email to store owner
    const adminResult = await resend.emails.send({
      from: fromEmail,
      to: notificationEmail,
      subject: `🛍️ Nouvelle commande #${order.orderNumber} (${Number(order.total).toLocaleString("fr-DZ")} DA) - ${order.customerName}`,
      html: emailHtml,
    });

    if (adminResult.error) {
      console.error("[Resend] Admin send error:", adminResult.error);
    } else {
      console.log("[Resend] Order notification sent successfully! ID:", adminResult.data?.id);
    }

    // Attempt sending confirmation to customer if an email was provided
    if (order.customerEmail && order.customerEmail.includes("@")) {
      try {
        await resend.emails.send({
          from: fromEmail,
          to: order.customerEmail,
          subject: `Confirmation de votre commande #${order.orderNumber} - Boutique Milina`,
          html: emailHtml,
        });
      } catch (custErr) {
        console.warn("[Resend] Could not send confirmation to customer (domain verification required for external recipients):", custErr);
      }
    }

    return { ok: true, data: adminResult.data };
  } catch (error) {
    console.error("[Resend] Critical error sending order email:", error);
    return { ok: false, error: String(error) };
  }
}

export async function sendContactMessageEmail(data: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}) {
  try {
    const config = await getEmailConfig();
    if (!config) {
      console.warn("[Resend] Resend API key not configured, skipping contact email.");
      return { ok: false, error: "RESEND_API_KEY is not configured" };
    }
    const { resend, notificationEmail, fromEmail } = config;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Nouveau message de contact</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f7f8; margin: 0; padding: 24px; color: #111;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #eaeaea; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
            
            <div style="background-color: #000000; color: #ffffff; padding: 24px 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 20px; letter-spacing: 3px; font-weight: 700; text-transform: uppercase;">BOUTIQUE MILINA</h1>
              <p style="margin: 8px 0 0 0; font-size: 13px; color: #d1d1d1; letter-spacing: 1px;">Nouveau Message de Contact</p>
            </div>

            <div style="padding: 32px;">
              <table style="width: 100%; font-size: 14px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 6px 0; color: #777; width: 120px;">Nom:</td>
                  <td style="padding: 6px 0; font-weight: 600; color: #111;">${data.name}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #777;">Email:</td>
                  <td style="padding: 6px 0; font-weight: 600; color: #111;"><a href="mailto:${data.email}" style="color: #000; text-decoration: underline;">${data.email}</a></td>
                </tr>
                ${
                  data.phone
                    ? `<tr>
                        <td style="padding: 6px 0; color: #777;">Téléphone:</td>
                        <td style="padding: 6px 0; font-weight: 600; color: #111;"><a href="tel:${data.phone}" style="color: #000; text-decoration: underline;">${data.phone}</a></td>
                      </tr>`
                    : ""
                }
              </table>

              <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; color: #555;">Message:</h3>
              <div style="background-color: #f9f9fa; border-left: 3px solid #000; padding: 16px; border-radius: 4px; font-size: 14px; line-height: 1.6; color: #222; white-space: pre-wrap;">
${data.message}
              </div>

              <div style="margin-top: 28px; text-align: center;">
                <a href="mailto:${data.email}?subject=Re:%20Votre%20message%20-%20Boutique%20Milina" style="display: inline-block; background-color: #000; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 13px; font-weight: 600; letter-spacing: 0.5px;">
                  Répondre au message
                </a>
              </div>
            </div>

            <div style="background-color: #f5f5f5; border-top: 1px solid #eaeaea; padding: 16px; text-align: center; font-size: 11px; color: #888;">
              © ${new Date().getFullYear()} Boutique Milina · Notification formulaire de contact
            </div>
          </div>
        </body>
      </html>
    `;

    const res = await resend.emails.send({
      from: fromEmail,
      to: notificationEmail,
      replyTo: data.email,
      subject: `📩 Nouveau message de contact : ${data.name}`,
      html: emailHtml,
    });

    if (res.error) {
      console.error("[Resend] Contact send error:", res.error);
    }

    return { ok: true, data: res.data };
  } catch (error) {
    console.error("[Resend] Error sending contact email:", error);
    return { ok: false, error: String(error) };
  }
}
