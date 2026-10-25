import { MetadataRoute } from "next";
import { getCachedProducts, getCachedCategories } from "@/lib/cache";

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://milina.shop";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/commander`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/cgu`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await getCachedProducts({ limit: 100 });
    productRoutes = products.map((p) => ({
      url: `${baseUrl}/produit/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {}

  let categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const categories = await getCachedCategories();
    categoryRoutes = categories.map((c) => ({
      url: `${baseUrl}/categorie/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch {}

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
