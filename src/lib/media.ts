// src/lib/media.ts
const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const BUCKET = "media";

function resolveUrl(raw: string): string {
  const value = raw.trim();
  if (!value) return "";

  // رابط كامل أو data URI
  if (/^(https?:)?\/\//i.test(value) || value.startsWith("data:")) {
    return value.startsWith("//") ? `https:${value}` : value;
  }

  // مسار داخل المشروع (public/)
  if (value.startsWith("/")) return value;

  // مسار نسبي من Supabase Storage
  if (SUPABASE_URL) {
    const path = value.replace(/^storage\/v1\/object\/public\//, "");
    const hasBucket = path.startsWith("media/") || path.startsWith("products/");
    const full = hasBucket ? path : `${BUCKET}/${path}`;
    return `${SUPABASE_URL}/storage/v1/object/public/${full
      .split("/")
      .map(encodeURIComponent)
      .join("/")}`;
  }

  return value;
}

function extract(item: unknown): string {
  if (typeof item === "string") return resolveUrl(item);
  if (item && typeof item === "object") {
    const obj = item as Record<string, unknown>;
    for (const key of ["url", "src", "imageUrl", "image_url", "publicUrl", "path"]) {
      const v = obj[key];
      if (typeof v === "string" && v.trim()) return resolveUrl(v);
    }
  }
  return "";
}

export function normalizeImages(input: unknown): string[] {
  let data = input;

  // قد تصل القيمة كنص JSON
  if (typeof data === "string") {
    const s = data.trim();
    if (s.startsWith("[") || s.startsWith("{")) {
      try {
        data = JSON.parse(s);
      } catch {
        /* تجاهل */
      }
    }
  }

  if (Array.isArray(data)) return data.map(extract).filter(Boolean);
  const single = extract(data);
  return single ? [single] : [];
}
