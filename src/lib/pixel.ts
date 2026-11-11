"use client";

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue?: unknown[];
      loaded?: boolean;
      version?: string;
    };
    _fbq?: unknown;
    ttq?: {
      page: () => void;
      track: (event: string, params?: Record<string, unknown>) => void;
      identify?: (params?: Record<string, unknown>) => void;
      instance?: (id: string) => unknown;
      load?: (id: string, opts?: unknown) => void;
      [key: string]: unknown;
    };
  }
}

function isDebugEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return (
    process.env.NODE_ENV === "development" ||
    window.localStorage?.getItem("milina_pixel_debug") === "true"
  );
}

function logPixel(service: "Meta" | "TikTok", event: string, params?: unknown) {
  if (isDebugEnabled()) {
    console.log(
      `%c[Pixel ${service}] %c${event}`,
      "background: #0284c7; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold;",
      "color: #0284c7; font-weight: bold;",
      params || ""
    );
  }
}

/**
 * Track standard PageView on route change or initial load
 */
export function trackPageView() {
  if (typeof window === "undefined") return;

  if (typeof window.fbq === "function") {
    window.fbq("track", "PageView");
    logPixel("Meta", "PageView");
  }

  if (typeof window.ttq?.page === "function") {
    window.ttq.page();
    logPixel("TikTok", "PageView");
  }
}

/**
 * Track ViewContent when a user views a product page
 */
export function trackViewContent(product: {
  id: number | string;
  name: string;
  price: number;
  category?: string;
  currency?: string;
}) {
  if (typeof window === "undefined") return;

  const currency = product.currency || "DZD";
  const numPrice = Number(product.price) || 0;

  if (typeof window.fbq === "function") {
    const params = {
      content_name: product.name,
      content_ids: [String(product.id)],
      content_type: "product",
      content_category: product.category,
      value: numPrice,
      currency,
    };
    window.fbq("track", "ViewContent", params);
    logPixel("Meta", "ViewContent", params);
  }

  if (typeof window.ttq?.track === "function") {
    const params = {
      content_id: String(product.id),
      content_type: "product",
      content_name: product.name,
      content_category: product.category,
      price: numPrice,
      value: numPrice,
      currency,
    };
    window.ttq.track("ViewContent", params);
    logPixel("TikTok", "ViewContent", params);
  }
}

/**
 * Track AddToCart when a product is added to cart
 */
export function trackAddToCart(item: {
  id: number | string;
  name: string;
  price: number;
  quantity?: number;
  category?: string;
  currency?: string;
}) {
  if (typeof window === "undefined") return;

  const currency = item.currency || "DZD";
  const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
  const numPrice = Number(item.price) || 0;
  const totalValue = numPrice * qty;

  if (typeof window.fbq === "function") {
    const params = {
      content_name: item.name,
      content_ids: [String(item.id)],
      content_type: "product",
      content_category: item.category,
      value: totalValue,
      currency,
      contents: [
        {
          id: String(item.id),
          quantity: qty,
          item_price: numPrice,
        },
      ],
    };
    window.fbq("track", "AddToCart", params);
    logPixel("Meta", "AddToCart", params);
  }

  if (typeof window.ttq?.track === "function") {
    const params = {
      content_id: String(item.id),
      content_type: "product",
      content_name: item.name,
      content_category: item.category,
      quantity: qty,
      price: numPrice,
      value: totalValue,
      currency,
    };
    window.ttq.track("AddToCart", params);
    logPixel("TikTok", "AddToCart", params);
  }
}

/**
 * Track InitiateCheckout when the user reaches checkout page
 */
export function trackInitiateCheckout(data: {
  items: Array<{
    id: number | string;
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  currency?: string;
}) {
  if (typeof window === "undefined") return;

  const currency = data.currency || "DZD";
  const totalValue = Number(data.total) || 0;

  if (typeof window.fbq === "function") {
    const params = {
      content_ids: data.items.map((i) => String(i.id)),
      content_type: "product",
      contents: data.items.map((i) => ({
        id: String(i.id),
        quantity: i.quantity,
        item_price: Number(i.price),
      })),
      num_items: data.items.reduce((s, i) => s + i.quantity, 0),
      value: totalValue,
      currency,
    };
    window.fbq("track", "InitiateCheckout", params);
    logPixel("Meta", "InitiateCheckout", params);
  }

  if (typeof window.ttq?.track === "function") {
    const params = {
      contents: data.items.map((i) => ({
        content_id: String(i.id),
        content_name: i.name,
        quantity: i.quantity,
        price: Number(i.price),
      })),
      value: totalValue,
      currency,
    };
    window.ttq.track("InitiateCheckout", params);
    logPixel("TikTok", "InitiateCheckout", params);
  }
}

/**
 * Track Purchase (CompletePayment on TikTok) when order is submitted
 */
export function trackPurchase(order: {
  orderNumber: string;
  total: number;
  items?: Array<{
    id: number | string;
    name: string;
    price: number;
    quantity: number;
  }>;
  currency?: string;
}) {
  if (typeof window === "undefined") return;

  const currency = order.currency || "DZD";
  const totalValue = Number(order.total) || 0;
  const items = order.items || [];

  if (typeof window.fbq === "function") {
    const params = {
      content_type: "product",
      content_ids: items.map((i) => String(i.id)),
      contents: items.map((i) => ({
        id: String(i.id),
        quantity: i.quantity,
        item_price: Number(i.price),
      })),
      num_items: items.reduce((s, i) => s + i.quantity, 0),
      value: totalValue,
      currency,
      order_id: order.orderNumber,
    };
    window.fbq("track", "Purchase", params);
    logPixel("Meta", "Purchase", params);
  }

  if (typeof window.ttq?.track === "function") {
    const params = {
      content_type: "product",
      contents: items.map((i) => ({
        content_id: String(i.id),
        content_name: i.name,
        quantity: i.quantity,
        price: Number(i.price),
      })),
      value: totalValue,
      currency,
      order_id: order.orderNumber,
    };
    window.ttq.track("CompletePayment", params);
    logPixel("TikTok", "CompletePayment", params);
  }
}

/**
 * Track Contact / Lead when sending contact form
 */
export function trackContact() {
  if (typeof window === "undefined") return;

  if (typeof window.fbq === "function") {
    window.fbq("track", "Contact");
    logPixel("Meta", "Contact");
  }

  if (typeof window.ttq?.track === "function") {
    window.ttq.track("Contact");
    logPixel("TikTok", "Contact");
  }
}

/**
 * Track AddToWishlist
 */
export function trackAddToWishlist(item: {
  id: number | string;
  name?: string;
  price?: number;
  currency?: string;
}) {
  if (typeof window === "undefined") return;

  const currency = item.currency || "DZD";
  const numPrice = Number(item.price) || 0;

  if (typeof window.fbq === "function") {
    const params = {
      content_ids: [String(item.id)],
      content_name: item.name,
      content_type: "product",
      value: numPrice,
      currency,
    };
    window.fbq("track", "AddToWishlist", params);
    logPixel("Meta", "AddToWishlist", params);
  }

  if (typeof window.ttq?.track === "function") {
    const params = {
      content_id: String(item.id),
      content_name: item.name,
      content_type: "product",
      value: numPrice,
      currency,
    };
    window.ttq.track("AddToWishlist", params);
    logPixel("TikTok", "AddToWishlist", params);
  }
}
