import { unstable_cache } from "next/cache";
import { getCategories, getProducts, getAllSettings, getCustomerReviews, getProductBySlug } from "./data";

// Keep catalog data fresh and invalidate it after admin product changes.
export const getCachedCategories = unstable_cache(
  async () => getCategories(),
  ["categories"],
  { revalidate: 86400 }
);

export const getCachedProducts = unstable_cache(
  async (filter?: { category?: string; search?: string; featured?: boolean; limit?: number }) =>
    getProducts(filter),
  ["products"],
  { revalidate: 86400, tags: ["products"] }
);

export const getCachedProductBySlug = unstable_cache(
  async (slug: string) => getProductBySlug(slug),
  ["product-by-slug"],
  { revalidate: 86400, tags: ["products"] }
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
