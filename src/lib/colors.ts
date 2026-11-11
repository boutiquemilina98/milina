/**
 * Utility to map color names (French, Arabic, English, Hex)
 * to visual CSS color values / backgrounds for swatch rendering.
 */

function normalize(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // remove accents (é -> e, etc.)
}

const COLOR_MAP: Record<string, string> = {
  // === NOIR / BLACK ===
  noir: "#000000",
  noire: "#000000",
  black: "#000000",
  "أسود": "#000000",
  "اسود": "#000000",
  "سوداء": "#000000",

  // === BLANC / WHITE ===
  blanc: "#ffffff",
  blanche: "#ffffff",
  white: "#ffffff",
  "أبيض": "#ffffff",
  "ابيض": "#ffffff",
  "بيضاء": "#ffffff",
  "blanc casse": "#f7f7f2",
  "off white": "#f8f8f6",
  "off-white": "#f8f8f6",
  "أوف وايت": "#f8f8f6",

  // === BEIGE / TAN / CAMEL ===
  beige: "#d0b589",
  "beige clair": "#e5d5be",
  "beige fonce": "#b89c6f",
  sand: "#dcc7a1",
  sable: "#dcc7a1",
  camel: "#c18a56",
  chameau: "#c18a56",
  جملي: "#c18a56",
  كاميل: "#c18a56",
  بيج: "#d0b589",
  "بيج فاتح": "#e5d5be",
  "بيج داكن": "#b89c6f",
  nude: "#deb887",
  tan: "#d2b48c",

  // === MARRON / BROWN ===
  marron: "#582b0e",
  brown: "#582b0e",
  chocolat: "#4b2810",
  chocolate: "#4b2810",
  cafe: "#5c4033",
  coffee: "#5c4033",
  "marron clair": "#7d4828",
  "marron fonce": "#3b1e0a",
  بني: "#582b0e",
  مارون: "#582b0e",
  شوكولا: "#4b2810",
  بنية: "#582b0e",
  قهوة: "#5c4033",

  // === BLEU / BLUE ===
  bleu: "#1e70ba",
  blue: "#1e70ba",
  "bleu ciel": "#87ceeb",
  "sky blue": "#87ceeb",
  "bleu clair": "#70a9db",
  "light blue": "#70a9db",
  marine: "#0f1f38",
  "bleu marine": "#0f1f38",
  navy: "#0f1f38",
  "navy blue": "#0f1f38",
  "bleu nuit": "#121a2c",
  "midnight blue": "#121a2c",
  "bleu roi": "#1f45fc",
  "royal blue": "#1f45fc",
  "bleu jean": "#4a6b82",
  jean: "#4a6b82",
  petrole: "#1d4e5f",
  turquoise: "#40e0d0",
  teal: "#008080",
  أزرق: "#1e70ba",
  ازرق: "#1e70ba",
  زرقاء: "#1e70ba",
  كحلي: "#0f1f38",
  "أزرق داكن": "#0f1f38",
  "ازرق داكن": "#0f1f38",
  سماوي: "#87ceeb",
  "أزرق فاتح": "#87ceeb",
  "ازرق فاتح": "#87ceeb",
  "أزرق ملكي": "#1f45fc",
  "ازرق ملكي": "#1f45fc",
  نيلي: "#264653",
  بترولي: "#1d4e5f",
  تركواز: "#40e0d0",
  تيركواز: "#40e0d0",

  // === ROUGE / RED ===
  rouge: "#dc3535",
  red: "#dc3535",
  bordeaux: "#6b1d2f",
  burgundy: "#6b1d2f",
  wine: "#6b1d2f",
  bourgogne: "#6b1d2f",
  "rouge bordeaux": "#6b1d2f",
  "bordeaux fonce": "#4a121e",
  grenat: "#6b1d2f",
  rubis: "#9b111e",
  أحمر: "#dc3535",
  احمر: "#dc3535",
  حمراء: "#dc3535",
  عنابي: "#6b1d2f",
  خمري: "#6b1d2f",
  بوردو: "#6b1d2f",

  // === VERT / GREEN ===
  vert: "#2e7d32",
  verte: "#2e7d32",
  green: "#2e7d32",
  "vert clair": "#4caf50",
  "light green": "#4caf50",
  "vert fonce": "#1b5e20",
  "dark green": "#1b5e20",
  "vert bouteille": "#1b4332",
  "vert sapin": "#1a4731",
  kaki: "#706b49",
  khaki: "#706b49",
  olive: "#556b2f",
  "vert olive": "#556b2f",
  "vert militaire": "#596347",
  sauge: "#9caf88",
  "vert sauge": "#9caf88",
  sage: "#9caf88",
  menthe: "#98ff98",
  "vert menthe": "#98ff98",
  mint: "#98ff98",
  "vert d'eau": "#a3d9c9",
  emeraude: "#50c878",
  "vert emeraude": "#50c878",
  emerald: "#50c878",
  أخضر: "#2e7d32",
  اخضر: "#2e7d32",
  خضراء: "#2e7d32",
  زيتي: "#556b2f",
  زيتوني: "#556b2f",
  كاكي: "#706b49",
  فستقي: "#93c572",
  نعناعي: "#98ff98",
  زمردي: "#50c878",

  // === ROSE / PINK ===
  rose: "#f48fb1",
  pink: "#f48fb1",
  "rose poudre": "#ecc5c8",
  "blush pink": "#ecc5c8",
  "rose clair": "#fce4ec",
  "light pink": "#fce4ec",
  "rose bonbon": "#ff69b4",
  "hot pink": "#ff69b4",
  "vieux rose": "#c48b9f",
  fuchsia: "#d92582",
  fuschia: "#d92582",
  magenta: "#d92582",
  وردي: "#f48fb1",
  وردية: "#f48fb1",
  زهري: "#f48fb1",
  زهرية: "#f48fb1",
  "وردي فاتح": "#ecc5c8",
  "زهري فاتح": "#ecc5c8",
  فوشيا: "#d92582",
  فوشي: "#d92582",

  // === VIOLET / PURPLE / MAUVE ===
  violet: "#7b2cbf",
  violette: "#7b2cbf",
  purple: "#7b2cbf",
  mauve: "#d3b2d1",
  lilas: "#c8a2c8",
  lilac: "#c8a2c8",
  lavande: "#e6e6fa",
  lavender: "#e6e6fa",
  prune: "#4e1b3d",
  plum: "#4e1b3d",
  pourpre: "#800080",
  بنفسجي: "#7b2cbf",
  موف: "#d3b2d1",
  ليلكي: "#c8a2c8",
  برقوقي: "#4e1b3d",

  // === JAUNE / YELLOW / MOUTARDE ===
  jaune: "#facc15",
  yellow: "#facc15",
  "jaune moutarde": "#e1ad01",
  moutarde: "#e1ad01",
  mustard: "#e1ad01",
  ocre: "#c99700",
  ochre: "#c99700",
  أصفر: "#facc15",
  اصفر: "#facc15",
  صفراء: "#facc15",
  خردلي: "#e1ad01"
};

// Add remaining mappings
Object.assign(COLOR_MAP, {
  // === ORANGE / TERRACOTTA ===
  orange: "#ea580c",
  rouille: "#a84a28",
  rust: "#a84a28",
  terracotta: "#c9654d",
  "terra cotta": "#c9654d",
  brique: "#9e4732",
  brick: "#9e4732",
  corail: "#ff6f61",
  coral: "#ff6f61",
  saumon: "#fa8072",
  salmon: "#fa8072",
  peche: "#f4a261",
  peach: "#f4a261",
  abricot: "#fb923c",
  برتقالي: "#ea580c",
  قرميدي: "#c9654d",
  طوبي: "#c9654d",
  ترابي: "#c9654d",
  مرجاني: "#ff6f61",
  مشمشي: "#fb923c",
  خوخي: "#f4a261",

  // === CREME / IVOIRE / TAUPE ===
  creme: "#fbf8ee",
  crème: "#fbf8ee",
  cream: "#fbf8ee",
  ivoire: "#fffff0",
  ivory: "#fffff0",
  ecru: "#f3eed9",
  écru: "#f3eed9",
  taupe: "#87796f",
  كريمي: "#fbf8ee",
  سكري: "#fbf8ee",
  عاجي: "#fffff0",
  رملي: "#dcc7a1",

  // === GRIS / GREY ===
  gris: "#808080",
  grise: "#808080",
  grey: "#808080",
  gray: "#808080",
  "gris clair": "#d1d5db",
  "light grey": "#d1d5db",
  "light gray": "#d1d5db",
  "gris fonce": "#374151",
  "dark grey": "#374151",
  "dark gray": "#374151",
  anthracite: "#2d3748",
  charcoal: "#2d3748",
  "gris perle": "#c4c4c4",
  رمادي: "#808080",
  رصاصي: "#808080",
  سكني: "#808080",
  "رمادي فاتح": "#d1d5db",
  "رمادي داكن": "#374151",
  فحمي: "#2d3748",

  // === METALLIC ===
  dore: "linear-gradient(135deg, #d4a556, #f5d89a)",
  dore_: "#d4af37",
  or: "#d4af37",
  gold: "linear-gradient(135deg, #d4a556, #f5d89a)",
  golden: "#d4af37",
  ذهبي: "linear-gradient(135deg, #d4a556, #f5d89a)",
  argent: "#c0c0c0",
  argente: "#c0c0c0",
  silver: "#c0c0c0",
  فضي: "#c0c0c0",
  bronze: "#cd7f32",
  cuivre: "#b87333",
  copper: "#b87333",

  // === PATTERNS / MULTI ===
  multicolore: "conic-gradient(#ef4444, #f59e0b, #22c55e, #3b82f6, #a855f7, #ef4444)",
  multi: "conic-gradient(#ef4444, #f59e0b, #22c55e, #3b82f6, #a855f7, #ef4444)",
  multicolor: "conic-gradient(#ef4444, #f59e0b, #22c55e, #3b82f6, #a855f7, #ef4444)",
  ملون: "conic-gradient(#ef4444, #f59e0b, #22c55e, #3b82f6, #a855f7, #ef4444)",
  "متعدد الألوان": "conic-gradient(#ef4444, #f59e0b, #22c55e, #3b82f6, #a855f7, #ef4444)",
  "noir & blanc": "linear-gradient(135deg, #000000 50%, #ffffff 50%)",
  "noir et blanc": "linear-gradient(135deg, #000000 50%, #ffffff 50%)",
  "black & white": "linear-gradient(135deg, #000000 50%, #ffffff 50%)",
});

export interface SwatchInfo {
  background: string;
  isLight: boolean;
  thumbnailUrl?: string;
  label: string;
  isFallback?: boolean;
}

/**
 * Returns CSS background representation for a given color string.
 * Supports direct hex/rgb, mapped French/Arabic/English names, and image fallbacks.
 */
export function getColorSwatch(
  colorName: string,
  images?: { color?: string; url: string }[]
): SwatchInfo {
  const raw = (colorName || "").trim();
  const lower = raw.toLowerCase();
  const normalized = normalize(raw);

  // 1. Direct hex or rgb
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw) || /^rgba?\(|^hsla?\(/i.test(raw)) {
    const isLight = raw.startsWith("#") ? isHexLight(raw) : false;
    return { background: raw, isLight, label: raw };
  }

  // 2. Check exact / normalized map
  let found = COLOR_MAP[raw] || COLOR_MAP[lower] || COLOR_MAP[normalized];

  if (!found) {
    // Try partial word matches (e.g. "Bleu ciel délavé" -> contains "bleu ciel")
    for (const key of Object.keys(COLOR_MAP)) {
      if (normalized.includes(key)) {
        found = COLOR_MAP[key];
        break;
      }
    }
  }

  // 3. Fallback: Check if there's an image with matching color
  let thumb: string | undefined = undefined;
  if (images && images.length > 0) {
    const matchedImg = images.find(
      (img) =>
        img.color &&
        (normalize(img.color) === normalized ||
          img.color.toLowerCase() === lower ||
          normalized.includes(normalize(img.color)))
    );
    if (matchedImg && matchedImg.url && !/\.(mp4|webm|mov)(\?|$)/i.test(matchedImg.url)) {
      thumb = matchedImg.url;
    }
  }

  if (found) {
    const isLight = isBackgroundLight(found);
    return { background: found, isLight, thumbnailUrl: thumb, label: raw };
  }

  // 4. Default fallback: use thumbnail if available, else neutral background
  if (thumb) {
    return {
      background: `url("${thumb}") center/cover no-repeat`,
      isLight: false,
      thumbnailUrl: thumb,
      label: raw,
    };
  }

  // CSS named colors fallback or gentle placeholder
  return {
    background: "#e5e7eb",
    isLight: true,
    label: raw,
    isFallback: true,
  };
}

/** Legacy helper */
export function getColorValue(name: string): string {
  return getColorSwatch(name).background;
}

function isHexLight(hex: string): boolean {
  let c = hex.replace("#", "");
  if (c.length === 3) {
    c = c.split("").map((x) => x + x).join("");
  }
  const r = parseInt(c.substring(0, 2), 16) || 0;
  const g = parseInt(c.substring(2, 4), 16) || 0;
  const b = parseInt(c.substring(4, 6), 16) || 0;
  // Perceived brightness
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 200;
}

function isBackgroundLight(bg: string): boolean {
  if (bg.startsWith("#")) {
    return isHexLight(bg);
  }
  const lightValues = [
    "#ffffff",
    "#f7f7f2",
    "#f8f8f6",
    "#fbf8ee",
    "#fffff0",
    "#f3eed9",
    "#e5d5be",
    "#dcc7a1",
    "#d1d5db",
    "#e6e6fa",
    "#fce4ec",
    "#ecc5c8",
  ];
  return lightValues.some((v) => bg.includes(v));
}
