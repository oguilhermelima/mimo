import { relations, sql } from "drizzle-orm";
import { pgTable, type AnyPgColumn } from "drizzle-orm/pg-core";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const PAYMENT_METHODS = ["pix", "credito", "debito", "ted"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const MEDIA_KINDS = ["image", "video"] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];

/**
 * Single-table polymorphic products:
 * - a "caixa" and a "sabonete" are both rows in `products`
 * - parentId lets you compose (sabonete is child of caixa)
 * - price is optional because display-only / composite items may not price individually
 */
export const Product = pgTable("product", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  parentId: t
    .uuid("parent_id")
    .references((): AnyPgColumn => Product.id, { onDelete: "set null" }),

  slug: t.varchar({ length: 120 }).notNull().unique(),
  title: t.varchar({ length: 200 }).notNull(),
  description: t.text(),

  priceCents: t.integer("price_cents"),
  hidden: t.boolean().notNull().default(false),

  color: t.varchar({ length: 40 }),
  widthMm: t.integer("width_mm"),
  heightMm: t.integer("height_mm"),
  depthMm: t.integer("depth_mm"),

  tags: t.text().array().notNull().default(sql`ARRAY[]::text[]`),
  paymentMethods: t
    .text("payment_methods")
    .array()
    .notNull()
    .default(sql`ARRAY['pix','credito','debito','ted']::text[]`)
    .$type<PaymentMethod[]>(),

  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}));

export const ProductMedia = pgTable("product_media", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  productId: t
    .uuid("product_id")
    .notNull()
    .references(() => Product.id, { onDelete: "cascade" }),
  kind: t.varchar({ length: 16 }).notNull().$type<MediaKind>(),
  url: t.text().notNull(),
  alt: t.varchar({ length: 200 }),
  sortOrder: t.integer("sort_order").notNull().default(0),
  createdAt: t.timestamp().defaultNow().notNull(),
}));

export const productRelations = relations(Product, ({ one, many }) => ({
  parent: one(Product, {
    fields: [Product.parentId],
    references: [Product.id],
    relationName: "parent_children",
  }),
  children: many(Product, { relationName: "parent_children" }),
  media: many(ProductMedia),
}));

export const productMediaRelations = relations(ProductMedia, ({ one }) => ({
  product: one(Product, {
    fields: [ProductMedia.productId],
    references: [Product.id],
  }),
}));

const dimensionsSchema = z.object({
  widthMm: z.number().int().nonnegative().nullable().optional(),
  heightMm: z.number().int().nonnegative().nullable().optional(),
  depthMm: z.number().int().nonnegative().nullable().optional(),
});

export const CreateProductSchema = createInsertSchema(Product, {
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "slug deve conter apenas letras minúsculas, números e hifens"),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).nullish(),
  priceCents: z.number().int().nonnegative().nullish(),
  color: z.string().max(40).nullish(),
  tags: z.array(z.string().min(1).max(40)).default([]),
  paymentMethods: z.array(z.enum(PAYMENT_METHODS)).default([...PAYMENT_METHODS]),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const UpdateProductSchema = createUpdateSchema(Product, {
  paymentMethods: z.array(z.enum(PAYMENT_METHODS)).optional(),
  tags: z.array(z.string().min(1).max(40)).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const CreateProductMediaSchema = createInsertSchema(ProductMedia, {
  url: z.string().url().max(2000),
  kind: z.enum(MEDIA_KINDS),
  alt: z.string().max(200).nullish(),
}).omit({ id: true, createdAt: true });

export { dimensionsSchema };
