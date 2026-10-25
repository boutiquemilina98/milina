import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  numeric,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

// ============ Enums ============
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "cod",
  "card",
  "transfer",
]);

// ============ Categories ============
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============ Products ============
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  categoryId: integer("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  comparePrice: numeric("compare_price", { precision: 12, scale: 2 }),
  currency: varchar("currency", { length: 8 }).notNull().default("DA"),
  images: jsonb("images")
    .$type<{ url: string; color: string }[]>()
    .notNull()
    .default([]),
  sizes: jsonb("sizes").$type<string[]>().notNull().default([]),
  variants: jsonb("variants")
    .$type<{ color: string; size: string; quantity: number }[]>()
    .notNull()
    .default([]),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  isFeatured: boolean("is_featured").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============ Orders ============
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("order_number", { length: 32 }).notNull().unique(),
  customerName: varchar("customer_name", { length: 160 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 32 }).notNull(),
  customerEmail: varchar("customer_email", { length: 200 }),
  wilaya: varchar("wilaya", { length: 80 }).notNull(),
  commune: varchar("commune", { length: 120 }).notNull(),
  address: text("address").notNull(),
  notes: text("notes"),
  items: jsonb("items")
    .$type<
      Array<{
        productId: number;
        name: string;
        price: number;
        quantity: number;
        size?: string;
        color?: string;
      }>
    >()
    .notNull()
    .default([]),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
  shipping: numeric("shipping", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  total: numeric("total", { precision: 12, scale: 2 }).notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  paymentMethod: paymentMethodEnum("payment_method").notNull().default("cod"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============ Customers ============
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  phone: varchar("phone", { length: 32 }).notNull().unique(),
  email: varchar("email", { length: 200 }),
  wilaya: varchar("wilaya", { length: 80 }),
  totalOrders: integer("total_orders").notNull().default(0),
  totalSpent: numeric("total_spent", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============ Admin Users ============
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 200 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  role: varchar("role", { length: 32 }).notNull().default("admin"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============ Settings (site config) ============
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 80 }).notNull().unique(),
  value: jsonb("value").$type<unknown>(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============ Supabase Config (reference table for admin) ============
export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 80 }).notNull().unique(),
  config: jsonb("config").$type<Record<string, string>>().notNull().default({}),
  isActive: boolean("is_active").notNull().default(false),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============ Contact Messages ============
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 200 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Setting = typeof settings.$inferSelect;
export type Integration = typeof integrations.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;