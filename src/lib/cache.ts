import { unstable_cache } from "next/cache";
import { getCategories, getProducts, getAllSettings, getCustomerReviews, getProductBySlug } from "./data";

// Keep catalog data fresh and invalidate it after admin product changes.
export const getCachedCategories = unstable_cache(
  async () => getCategories(),
  ["categories"],
  { revalidate: 3600 }
);

export const getCachedProducts = unstable_cache(
  async (filter?: { category?: string; search?: string; featured?: boolean; limit?: number }) =>
    getProducts(filter),
  ["products"],
  { revalidate: 3600, tags: ["products"] }
);

export const getCachedProductBySlug = (slug: string) => {
  const norm = (slug || "").trim().toLowerCase();
  return unstable_cache(
    async () => getProductBySlug(slug),
    ["product-by-slug", norm],
    { revalidate: 3600, tags: ["products"] }
  )();
};

export const getCachedSettings = unstable_cache(
  async () => getAllSettings(),
  ["settings"],
  { revalidate: 3600, tags: ["settings"] }
);

export const getCachedReviews = unstable_cache(
  async () => getCustomerReviews(),
  ["reviews"],
  { revalidate: 3600 }
);
