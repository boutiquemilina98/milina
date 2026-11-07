import { db } from "@/db";
import {
  categories,
  products,
  orders,
  customers,
  settings,
  integrations,
} from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import type {
  CategoryDTO,
  ProductDTO,
  ProductImage,
  OrderDTO,
  CustomerReviewDTO,
} from "./types";


// ============ Seed ============
const SEED_CATEGORIES = [
  { slug: "tout", name: "Tout", sortOrder: 0 },
  { slug: "ensembles", name: "Ensembles", sortOrder: 1 },
  { slug: "vestes", name: "vestes", sortOrder: 2 },
  { slug: "kimonos", name: "Kimonos", sortOrder: 3 },
  { slug: "robes", name: "Robes", sortOrder: 4 },
  { slug: "hauts", name: "Hauts", sortOrder: 5 },
  { slug: "jupes", name: "Jupes", sortOrder: 6 },
  { slug: "accessoires", name: "Accessoires", sortOrder: 7 },
  { slug: "caftans", name: "Caftans", sortOrder: 8 },
];

const SEED_PRODUCTS = [
  {
    slug: "caftan-le-royal",
    name: "Caftan Le Royal",
    description: "Caftan royal brodé à la main, idéal pour vos soirées de prestige.",
    category: "caftans",
    price: 18900,
    comparePrice: null,
    images: [
      { url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200&q=80", color: "Doré" },
    ],
    sizes: ["S", "M", "L", "XL"],
    variants: [
      { color: "Doré", size: "S", quantity: 3 },
      { color: "Doré", size: "M", quantity: 4 },
      { color: "Doré", size: "L", quantity: 3 },
      { color: "Doré", size: "XL", quantity: 2 },
    ],
    tags: ["nouveau", "premium"],
    isFeatured: true,
  },
  {
    slug: "night-dress",
    name: "Night Dress",
    description: "Robe longue fluide en satin, parfaite pour les grandes occasions.",
    category: "robes",
    price: 4500,
    comparePrice: null,
    images: [
      { url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1200&q=80", color: "Gris perle" },
    ],
    sizes: ["S", "M", "L"],
    variants: [
      { color: "Gris perle", size: "S", quantity: 8 },
      { color: "Gris perle", size: "M", quantity: 8 },
      { color: "Gris perle", size: "L", quantity: 8 },
    ],
    tags: ["tendance"],
    isFeatured: true,
  },
  {
    slug: "summer-top",
    name: "Summer Top",
    description: "Haut léger à motifs tie & dye, ultra confortable.",
    category: "hauts",
    price: 3200,
    comparePrice: null,
    images: [
      { url: "https://images.unsplash.com/photo-1551803091-e20673f15770?w=1200&q=80", color: "Multicolore" },
    ],
    sizes: ["S", "M", "L", "XL"],
    variants: [
      { color: "Multicolore", size: "S", quantity: 8 },
      { color: "Multicolore", size: "M", quantity: 8 },
      { color: "Multicolore", size: "L", quantity: 8 },
      { color: "Multicolore", size: "XL", quantity: 6 },
    ],
    tags: ["été"],
    isFeatured: true,
  },
  {
    slug: "gilet-brode",
    name: "Gilet Brodé",
    description: "Gilet sans manches avec broderies traditionnelles, élégance assurée.",
    category: "vestes",
    price: 3900,
    comparePrice: null,
    images: [
      { url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&q=80", color: "Noir" },
    ],
    sizes: ["S", "M", "L"],
    variants: [
      { color: "Noir", size: "S", quantity: 6 },
      { color: "Noir", size: "M", quantity: 6 },
      { color: "Noir", size: "L", quantity: 6 },
    ],
    tags: ["best-seller"],
    isFeatured: true,
  },
  {
    slug: "kimono-zebre",
    name: "Kimono Zébré",
    description: "Kimono long à motifs zèbre, pièce statement.",
    category: "kimonos",
    price: 2200,
    comparePrice: 4000,
    images: [
      { url: "https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=1200&q=80", color: "Noir & Blanc" },
    ],
    sizes: ["Unique"],
    variants: [
      { color: "Noir & Blanc", size: "Unique", quantity: 15 },
    ],
    tags: ["solde", "-44%"],
    isFeatured: true,
  },
  {
    slug: "abaya-oud",
    name: "Abaya Oud",
    description: "Abaya ample en tissu oud avec finitions dorées.",
    category: "robes",
    price: 4700,
    comparePrice: null,
    images: [
      { url: "https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=1200&q=80", color: "Marron" },
    ],
    sizes: ["M", "L", "XL"],
    variants: [
      { color: "Marron", size: "M", quantity: 4 },
      { color: "Marron", size: "L", quantity: 3 },
      { color: "Marron", size: "XL", quantity: 3 },
    ],
    tags: ["premium"],
    isFeatured: true,
  },
  {
    slug: "robe-cocktail-noire",
    name: "Robe Cocktail Noire",
    description: "Robe noire cintrée parfaite pour vos cocktails.",
    category: "robes",
    price: 5800,
    comparePrice: 7400,
    images: [
      { url: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=1200&q=80", color: "Noir" },
    ],
    sizes: ["XS", "S", "M", "L"],
    variants: [
      { color: "Noir", size: "XS", quantity: 2 },
      { color: "Noir", size: "S", quantity: 3 },
      { color: "Noir", size: "M", quantity: 2 },
      { color: "Noir", size: "L", quantity: 2 },
    ],
    tags: ["solde", "-22%"],
    isFeatured: false,
  },
  {
    slug: "ensemble-lin-premium",
    name: "Ensemble Lin Premium",
    description: "Ensemble deux pièces en lin, look minimaliste et chic.",
    category: "ensembles",
    price: 6900,
    comparePrice: null,
    images: [
      { url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80", color: "Beige" },
    ],
    sizes: ["S", "M", "L"],
    variants: [
      { color: "Beige", size: "S", quantity: 5 },
      { color: "Beige", size: "M", quantity: 5 },
      { color: "Beige", size: "L", quantity: 4 },
    ],
    tags: ["nouveau"],
    isFeatured: false,
  },
  {
    slug: "jupe-midi-plissee",
    name: "Jupe Midi Plissée",
    description: "Jupe midi plissée, fluide et élégante.",
    category: "jupes",
    price: 3400,
    comparePrice: null,
    images: [
      { url: "https://images.unsplash.com/photo-1583496661160-fb5886a13d44?w=1200&q=80", color: "Noir" },
    ],
    sizes: ["S", "M", "L"],
    variants: [
      { color: "Noir", size: "S", quantity: 8 },
      { color: "Noir", size: "M", quantity: 7 },
      { color: "Noir", size: "L", quantity: 7 },
    ],
    tags: ["tendance"],
    isFeatured: false,
  },
  {
    slug: "sac-cuir-noir",
    name: "Sac Cuir Noir",
    description: "Sac à main en cuir véritable, finition premium.",
    category: "accessoires",
    price: 4200,
    comparePrice: 5500,
    images: [
      { url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&q=80", color: "Noir" },
    ],
    sizes: ["Unique"],
    variants: [
      { color: "Noir", size: "Unique", quantity: 7 },
    ],
    tags: ["solde"],
    isFeatured: false,
  },
  {
    slug: "veste-tailleur-creme",
    name: "Veste Tailleur Crème",
    description: "Veste tailleur coupe oversize en couleur crème.",
    category: "vestes",
    price: 5200,
    comparePrice: null,
    images: [
      { url: "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=1200&q=80", color: "Crème" },
    ],
    sizes: ["S", "M", "L", "XL"],
    variants: [
      { color: "Crème", size: "S", quantity: 3 },
      { color: "Crème", size: "M", quantity: 3 },
      { color: "Crème", size: "L", quantity: 3 },
      { color: "Crème", size: "XL", quantity: 2 },
    ],
    tags: ["bureau"],
    isFeatured: false,
  },
  {
    slug: "haut-satin-blanc",
    name: "Haut Satin Blanc",
    description: "Haut en satin blanc à col bénitier.",
    category: "hauts",
    price: 2800,
    comparePrice: null,
    images: [
      { url: "https://images.unsplash.com/photo-1564257577-2d3a3f0b8a32?w=1200&q=80", color: "Blanc" },
    ],
    sizes: ["XS", "S", "M", "L"],
    variants: [
      { color: "Blanc", size: "XS", quantity: 5 },
      { color: "Blanc", size: "S", quantity: 5 },
      { color: "Blanc", size: "M", quantity: 5 },
      { color: "Blanc", size: "L", quantity: 5 },
    ],
    tags: ["essentiel"],
    isFeatured: false,
  },
];

const SEED_SETTINGS = [
  { key: "site_name", value: "Milina Luxury" },
  { key: "site_tagline", value: "Boutique de prêt-à-porter féminin" },
  { key: "contact_email", value: "milina.luxury@gmail.com" },
  { key: "contact_phone", value: "+213 555 000 000" },
  { key: "contact_address", value: "Algerie, Alger" },
  { key: "instagram_url", value: "https://instagram.com/milina.luxury" },
  { key: "facebook_url", value: "https://facebook.com/milina.luxury" },
  { key: "shipping_notice", value: "Livraison Rapide 58 Wilayas" },
  { key: "hero_title", value: "CAFTAN LE ROYAL" },
  { key: "hero_subtitle", value: "La nouvelle collection exclusive" },
  {
    key: "about_text",
    value:
      "Milina Luxury est votre boutique en ligne de prêt à porter pour femmes. Chez Milina Luxury, l'originalité est la seule règle. Révélez l'exception qui est en vous !",
  },
];

let isSeeded = false;

export async function ensureSeedData() {
  if (isSeeded) return;


  // Settings
  for (const s of SEED_SETTINGS) {
    const existing = await db
      .select()
      .from(settings)
      .where(eq(settings.key, s.key))
      .limit(1);
    if (existing.length === 0) {
      await db.insert(settings).values({ key: s.key, value: s.value });
    }
  }

  // Supabase integration placeholder
  const existingIntegration = await db
    .select()
    .from(integrations)
    .where(eq(integrations.name, "supabase"))
    .limit(1);
  if (existingIntegration.length === 0) {
    await db.insert(integrations).values({
      name: "supabase",
      config: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      },
      isActive: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    });
  }
  isSeeded = true;
}

// ============ Mappers ============
function toProductDTO(
  p: typeof products.$inferSelect,
  categorySlug?: string | null
): ProductDTO {
  const rawImgs = Array.isArray(p.images) ? p.images : [];
  const imgs: ProductImage[] = rawImgs.flatMap((rawImage: unknown, idx: number) => {
    let imageData: Record<string, unknown> = {};
    let url = "";

    if (typeof rawImage === "string") {
      url = rawImage.trim();
    } else if (rawImage && typeof rawImage === "object" && !Array.isArray(rawImage)) {
      imageData = rawImage as Record<string, unknown>;
      const storedUrl = ["url", "src", "imageUrl", "path"].find(
        (key) => typeof imageData[key] === "string" && imageData[key].trim()
      );
      if (storedUrl) url = (imageData[storedUrl] as string).trim();
    }

    if (!url) return [];
    if (url.startsWith("data:image/")) url = `/api/media/product/${p.id}/${idx}`;

    return [{
      ...imageData,
      url,
      color: typeof imageData.color === "string" ? imageData.color : "",
    } as ProductImage];
  });
  const vars = Array.isArray(p.variants) ? p.variants : [];
  const totalStock = vars.reduce((s, v) => s + (v.quantity || 0), 0);
  const colors = [...new Set(imgs.map((img: any) => img.color).filter(Boolean))];
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    categoryId: p.categoryId,
    categorySlug,
    price: parseFloat(p.price),
    comparePrice: p.comparePrice ? parseFloat(p.comparePrice) : null,
    currency: p.currency,
    images: imgs,
    sizes: p.sizes,
    variants: vars,
    tags: p.tags,
    isFeatured: p.isFeatured,
    isActive: p.isActive,
    totalStock,
    colors,
  };
}

function toCategoryDTO(c: typeof categories.$inferSelect): CategoryDTO {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    imageUrl: c.imageUrl,
    isActive: c.isActive,
  };
}

function toOrderDTO(o: typeof orders.$inferSelect): OrderDTO {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    customerEmail: o.customerEmail,
    wilaya: o.wilaya,
    commune: o.commune,
    address: o.address,
    notes: o.notes,
    items: o.items,
    subtotal: parseFloat(o.subtotal),
    shipping: parseFloat(o.shipping),
    total: parseFloat(o.total),
    status: o.status,
    paymentMethod: o.paymentMethod,
    createdAt: o.createdAt.toISOString(),
  };
}

// ============ Public Read APIs ============
export async function getCategories(): Promise<CategoryDTO[]> {
  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(categories.sortOrder);
  return rows.map(toCategoryDTO);
}

export async function getProducts(filter?: {
  category?: string;
  search?: string;
  featured?: boolean;
  limit?: number;
}): Promise<ProductDTO[]> {
  // Run two parallel queries to keep types simple
  const [allRows, cats] = await Promise.all([
    db.select().from(products).orderBy(desc(products.createdAt)),
    db.select().from(categories),
  ]);
  const catMap = new Map(cats.map((c) => [c.id, c.slug]));

  let result: ProductDTO[] = allRows
    .filter((p) => p.isActive)
    .map((p) => toProductDTO(p, catMap.get(p.categoryId ?? -1) ?? null));

  if (filter?.featured !== undefined) {
    result = result.filter((p) => p.isFeatured === filter.featured);
  }
  if (filter?.category && filter.category !== "tout") {
    result = result.filter((p) => p.categorySlug === filter.category);
  }
  if (filter?.search) {
    const term = filter.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.description?.toLowerCase().includes(term) ?? false)
    );
  }
  if (filter?.limit) result = result.slice(0, filter.limit);
  return result;
}

export async function getProductBySlug(slug: string): Promise<ProductDTO | null> {
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);
  if (rows.length === 0) return null;
  const cats = await db.select().from(categories);
  const catMap = new Map(cats.map((c) => [c.id, c.slug]));
  return toProductDTO(rows[0], catMap.get(rows[0].categoryId ?? -1) ?? null);
}

// ============ Admin APIs ============
export async function adminListProducts(): Promise<ProductDTO[]> {
  const rows = await db.select().from(products).orderBy(desc(products.createdAt));
  const cats = await db.select().from(categories);
  const catMap = new Map(cats.map((c) => [c.id, c.slug]));
  return rows.map((p) => toProductDTO(p, catMap.get(p.categoryId ?? -1) ?? null));
}

export async function adminListCategories(): Promise<CategoryDTO[]> {
  const rows = await db.select().from(categories).orderBy(categories.sortOrder);
  return rows.map(toCategoryDTO);
}

export async function adminListOrders(): Promise<OrderDTO[]> {
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));
  return rows.map(toOrderDTO);
}

export async function adminStats() {
  const [
    [productCount],
    [categoryCount],
    [orderCount],
    [customerCount],
    [revenue],
    recentOrders,
    cats,
    productsByCategory,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(products),
    db.select({ count: sql<number>`count(*)::int` }).from(categories),
    db.select({ count: sql<number>`count(*)::int` }).from(orders),
    db.select({ count: sql<number>`count(*)::int` }).from(customers),
    db.select({ total: sql<string>`coalesce(sum(total), 0)::text` }).from(orders),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(5),
    db.select().from(categories),
    db.select({ categoryId: products.categoryId, count: sql<number>`count(*)::int` }).from(products).groupBy(products.categoryId),
  ]);
  const catMap = new Map(cats.map((c) => [c.id, c.name]));

  return {
    products: productCount?.count ?? 0,
    categories: categoryCount?.count ?? 0,
    orders: orderCount?.count ?? 0,
    customers: customerCount?.count ?? 0,
    revenue: parseFloat(revenue?.total ?? "0"),
    recentOrders: recentOrders.map(toOrderDTO),
    productsByCategory: productsByCategory.map((p) => ({
      name: p.categoryId ? catMap.get(p.categoryId) ?? "Sans catégorie" : "Sans catégorie",
      count: p.count,
    })),
  };
}

export async function getAllSettings() {
  const rows = await db.select().from(settings);
  const result: Record<string, unknown> = {};
  for (const r of rows) {
    if (typeof r.value === "string" && r.value.startsWith("data:image/")) {
      result[r.key] = `/api/media/settings/${r.key}`;
    } else {
      result[r.key] = r.value;
    }
  }
  return result;
}

export async function getSupabaseIntegration() {
  const rows = await db
    .select()
    .from(integrations)
    .where(eq(integrations.name, "supabase"))
    .limit(1);
  return rows[0] ?? null;
}

export const DEFAULT_CUSTOMER_REVIEWS: CustomerReviewDTO[] = [
  {
    id: "rev_1",
    imageUrl: "https://jamsuwadufnsnespyhyp.supabase.co/storage/v1/object/public/media/review-1.jpg",
    clientName: "Sarah M.",
    city: "Alger",
    platform: "whatsapp",
    rating: 5,
    caption: "Caftan royal brodé reçu à Alger : Qualité juste WOW et livraison ultra rapide !",
    isActive: true,
    sortOrder: 0,
    createdAt: "2026-03-10T11:20:00.000Z",
  },
  {
    id: "rev_2",
    imageUrl: "https://jamsuwadufnsnespyhyp.supabase.co/storage/v1/object/public/media/review-2.jpg",
    clientName: "Yasmine K.",
    city: "Oran",
    platform: "instagram",
    rating: 5,
    caption: "Robe en soie livrée à Oran : Tissu fluide et sublime, emballage de luxe avec sac Milina",
    isActive: true,
    sortOrder: 1,
    createdAt: "2026-03-12T14:35:00.000Z",
  },
  {
    id: "rev_3",
    imageUrl: "https://jamsuwadufnsnespyhyp.supabase.co/storage/v1/object/public/media/review-3.jpg",
    clientName: "Amina T.",
    city: "Constantine",
    platform: "whatsapp",
    rating: 5,
    caption: "Commande express à Constantine : Boîte cadeau prestigieuse avec broderie exceptionnelle",
    isActive: true,
    sortOrder: 2,
    createdAt: "2026-03-14T15:30:00.000Z",
  },
];

export async function getCustomerReviews(): Promise<{
  reviews: CustomerReviewDTO[];
  title: string;
  subtitle: string;
  visible: boolean;
}> {
  try {
    const rows = await db
      .select()
      .from(settings)
      .where(sql`${settings.key} IN ('customer_reviews', 'reviews_section_title', 'reviews_section_subtitle', 'reviews_section_visible')`);
    
    const map = new Map(rows.map((r) => [r.key, r.value]));
    let reviews: CustomerReviewDTO[] = [];
    const rawReviews = map.get("customer_reviews");
    if (rawReviews) {
      if (typeof rawReviews === "string") {
        try {
          reviews = JSON.parse(rawReviews);
        } catch {
          reviews = [];
        }
      } else if (Array.isArray(rawReviews)) {
        reviews = rawReviews as CustomerReviewDTO[];
      }
    }

    if (!reviews || reviews.length === 0) {
      reviews = DEFAULT_CUSTOMER_REVIEWS;
    }

    reviews = reviews.map((r, idx) => {
      if (typeof r.imageUrl === "string" && r.imageUrl.startsWith("data:image/")) {
        return { ...r, imageUrl: `/api/media/review/${r.id || idx}` };
      }
      return r;
    });

    const title = (map.get("reviews_section_title") as string) || "Ce que disent nos clientes";
    const subtitle =
      (map.get("reviews_section_subtitle") as string) ||
      "Découvrez les retours et captures réels de nos clientes satisfaites";
    const visible =
      map.get("reviews_section_visible") !== false &&
      map.get("reviews_section_visible") !== "false";

    return { reviews, title, subtitle, visible };
  } catch (err) {
    return {
      reviews: DEFAULT_CUSTOMER_REVIEWS,
      title: "Ce que disent nos clientes",
      subtitle: "Découvrez les retours et captures réels de nos clientes satisfaites",
      visible: true,
    };
  }
}
