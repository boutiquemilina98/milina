import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { CartProvider } from "@/components/store/CartProvider";
import { StoreChrome } from "@/components/store/StoreChrome";
import { ensureSeedData } from "@/lib/data";
import { getCachedCategories, getCachedSettings } from "@/lib/cache";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://boutiquemilina.online").replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "BOUTIQUE MILINA - WORLD OF LUXURY",
  description:
    "Boutique Milina Luxury — L'univers d'une élégance intemporelle, où chaque pièce est choisie avec exigence pour révéler votre style. Élégance • Raffinement • Exclusivité",
  openGraph: {
    type: "website",
    siteName: "Boutique Milina",
    locale: "fr_FR",
    title: "BOUTIQUE MILINA - WORLD OF LUXURY",
    description:
      "Boutique Milina Luxury — L'univers d'une élégance intemporelle, où chaque pièce est choisie avec exigence pour révéler votre style.",
  },
  twitter: { card: "summary_large_image" },
  keywords: [
    "milina luxury",
    "boutique milina",
    "mode femme algérie",
    "caftan luxe",
    "robe de soirée",
    "kimono femme",
    "abaya élégante",
    "prêt-à-porter féminin",
    "livraison 58 wilayas",
    "boutique en ligne algérie",
    "tenue femme chic",
    "mode luxe",
  ],
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  try {
    await ensureSeedData();
  } catch {
    // DB might not be ready; UI still renders
  }

  let categories: Awaited<ReturnType<typeof getCachedCategories>> = [];
  let settings: Awaited<ReturnType<typeof getCachedSettings>> = {};
  try {
    [categories, settings] = await Promise.all([
      getCachedCategories(),
      getCachedSettings(),
    ]);
  } catch {
    // ignore — pages handle missing DB gracefully
  }

  return (
    <html
      lang="fr"
      style={{
        "--topbar-bg": settings.color_topbar_bg || undefined,
        "--topbar-text": settings.color_topbar_text || undefined,
        "--header-bg": settings.color_header_bg || undefined,
        "--header-icon": settings.color_header_icon || undefined,
        "--menu-bg": settings.color_menu_bg || undefined,
        "--menu-text": settings.color_menu_text || undefined,
        "--categories-bar-bg": settings.color_categories_bar_bg || undefined,
        "--category-item-bg": settings.color_category_item_bg || undefined,
        "--category-item-text": settings.color_category_item_text || undefined,
        "--category-active-bg": settings.color_category_active_bg || undefined,
        "--category-active-text": settings.color_category_active_text || undefined,
        "--bottombar-bg": settings.color_bottombar_bg || undefined,
        "--bottombar-icon-text": settings.color_bottombar_icon_text || undefined,
        "--store-bg": settings.color_store_bg || undefined,
        "--product-card-bg": settings.color_product_card_bg || undefined,
        "--product-card-btn-icon": settings.color_product_card_btn_icon || undefined,
        "--features-bg": settings.color_features_bg || undefined,
        "--footer-bg": settings.color_footer_bg || undefined,
        "--product-back-btn": settings.color_product_back_btn || undefined,
        "--product-fav-icon": settings.color_product_fav_icon || undefined,
        "--product-variant-btn": settings.color_product_variant_btn || undefined,
        "--add-to-cart-btn": settings.color_add_to_cart_btn || undefined,
        "--order-btn": settings.color_order_btn || undefined,
      } as React.CSSProperties}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@400;600;700;800;900&family=Cinzel:wght@400;600;700;800&family=Cormorant+Garamond:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {typeof settings.favicon_image === "string" && settings.favicon_image && (
          <link rel="icon" href={settings.favicon_image} />
        )}
      </head>
      <body className="min-h-screen bg-[var(--store-bg,#ffffff)] text-black antialiased overflow-x-hidden">
        <CartProvider>
          <StoreChrome categories={categories} settings={settings}>
            {children}
          </StoreChrome>
        </CartProvider>
      </body>
    </html>
  );
}
