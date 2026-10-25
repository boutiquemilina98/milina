import { unstable_cache } from "next/cache";
import { getCategories, getProducts, getAllSettings, getCustomerReviews, getProductBySlug } from "./data";

// ─── Cached Data Functions ──────────────────────────────────────
// These wrap the raw DB queries with Next.js unstable_cache,
// so repeated calls within the same build/request are deduped
// and results are cached for up to 24 hours. Pages will serve
// from cache and only hit the database when the cache expires.

export const getCachedCategories = unstable_cache(
  async () => getCategories(),
  ["categories"],
  { revalidate: 86400 }
);

export const getCachedProducts = unstable_cache(
  async (filter?: { category?: string; search?: string; featured?: boolean; limit?: number }) =>
    getProducts(filter),
  ["products"],
  { revalidate: 86400 }
);

export const getCachedProductBySlug = unstable_cache(
  async (slug: string) => getProductBySlug(slug),
  ["product-by-slug"],
  { revalidate: 86400 }
);

export const getCachedSettings = unstable_cache(
  async () => getAllSettings(),
  ["settings"],
  { revalidate: 86400 }
);

export const getCachedReviews = unstable_cache(
  async () => getCustomerReviews(),
  ["reviews"],
  { revalidate: 86400 }
);
