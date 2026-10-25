// Shared types between client and server
export interface ProductImage {
  url: string;
  color: string;
}

export interface ProductVariant {
  color: string;
  size: string;
  quantity: number;
}

export interface ProductDTO {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  categoryId: number | null;
  categorySlug?: string | null;
  price: number;
  comparePrice: number | null;
  currency: string;
  images: ProductImage[];
  sizes: string[];
  variants: ProductVariant[];
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  totalStock: number;
  colors: string[]; // computed: unique colors from images
}

export interface CategoryDTO {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
}

export interface CartItem {
  productId: number;
  slug: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
}

export interface OrderDTO {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  wilaya: string;
  commune: string;
  address: string;
  notes: string | null;
  items: Array<{
    productId: number;
    name: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  paymentMethod: "cod" | "card" | "transfer";
  createdAt: string;
}

export interface CustomerReviewDTO {
  id: string;
  imageUrl: string;
  clientName?: string;
  city?: string;
  rating?: number;
  caption?: string;
  platform?: "whatsapp" | "instagram" | "facebook" | "autre";
  isActive: boolean;
  sortOrder?: number;
  createdAt?: string;
}