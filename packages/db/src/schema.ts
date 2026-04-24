import { relations, sql } from "drizzle-orm";
import { index, pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const PAYMENT_METHODS = ["pix", "credito", "debito", "ted"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const MEDIA_KINDS = ["image", "video"] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];

export const PRODUCT_TYPES = [
  "template_box",
  "box",
  "jewelry",
  "perfume",
  "cosmetic",
] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export const BUNDLE_SOURCES = ["catalog", "user_order"] as const;
export type BundleSource = (typeof BUNDLE_SOURCES)[number];

export const PRICE_HISTORY_ENTITIES = ["product", "stamp", "bundle"] as const;
export type PriceHistoryEntity = (typeof PRICE_HISTORY_ENTITIES)[number];

export const COUPON_DISCOUNT_TYPES = ["percent", "fixed"] as const;
export type CouponDiscountType = (typeof COUPON_DISCOUNT_TYPES)[number];

export const COUPON_SCOPES = [
  "global",
  "product",
  "bundle",
  "product_type",
] as const;
export type CouponScope = (typeof COUPON_SCOPES)[number];

/**
 * Products: template_box/box são shells; jewelry/perfume/cosmetic são conteúdos.
 * Composição de caixas (pré-montadas e encomendas) vive na tabela `bundle`.
 */
export const Product = pgTable("product", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  type: t
    .varchar({ length: 32 })
    .notNull()
    .default("box")
    .$type<ProductType>(),

  slug: t.varchar({ length: 120 }).notNull().unique(),
  title: t.varchar({ length: 200 }).notNull(),
  description: t.text(),

  priceCents: t.integer("price_cents"),
  quantity: t.integer().notNull().default(0),
  lowStockThreshold: t.integer("low_stock_threshold").notNull().default(3),
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

/**
 * Estampas: aplicadas em caixas durante a montagem (bundle).
 * Estampa tem estoque próprio.
 */
export const Stamp = pgTable("stamp", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  slug: t.varchar({ length: 120 }).notNull().unique(),
  name: t.varchar({ length: 200 }).notNull(),
  description: t.text(),
  imageUrl: t.text("image_url"),
  priceCents: t.integer("price_cents"),
  quantity: t.integer().notNull().default(0),
  lowStockThreshold: t.integer("low_stock_threshold").notNull().default(3),
  hidden: t.boolean().notNull().default(false),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}));

/**
 * Bundle: caixa composta.
 * - source=catalog: admin monta caixa pronta pra loja (slug + price próprio)
 * - source=user_order: usuário monta no /encomenda (vira pedido)
 * priceCents null ⇒ soma dos items no read.
 */
export const Bundle = pgTable("bundle", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  slug: t.varchar({ length: 120 }).unique(),
  title: t.varchar({ length: 200 }).notNull(),
  description: t.text(),
  source: t.varchar({ length: 32 }).notNull().$type<BundleSource>(),

  templateBoxId: t
    .uuid("template_box_id")
    .references(() => Product.id, { onDelete: "restrict" }),
  stampId: t.uuid("stamp_id").references(() => Stamp.id, {
    onDelete: "set null",
  }),

  priceCents: t.integer("price_cents"),
  quantity: t.integer().notNull().default(0),
  lowStockThreshold: t.integer("low_stock_threshold").notNull().default(3),
  hidden: t.boolean().notNull().default(false),

  customerName: t.varchar("customer_name", { length: 200 }),
  customerNote: t.text("customer_note"),

  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}));

export const BundleMedia = pgTable("bundle_media", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  bundleId: t
    .uuid("bundle_id")
    .notNull()
    .references(() => Bundle.id, { onDelete: "cascade" }),
  kind: t.varchar({ length: 16 }).notNull().$type<MediaKind>(),
  url: t.text().notNull(),
  alt: t.varchar({ length: 200 }),
  sortOrder: t.integer("sort_order").notNull().default(0),
  createdAt: t.timestamp().defaultNow().notNull(),
}));

export const BundleItem = pgTable("bundle_item", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  bundleId: t
    .uuid("bundle_id")
    .notNull()
    .references(() => Bundle.id, { onDelete: "cascade" }),
  productId: t
    .uuid("product_id")
    .notNull()
    .references(() => Product.id, { onDelete: "restrict" }),
  quantity: t.integer().notNull().default(1),
  sortOrder: t.integer("sort_order").notNull().default(0),
}));

/**
 * Histórico de preços genérico: product | stamp | bundle.
 * Lookup rápido por (entityType, entityId) ordenado por changedAt.
 */
export const PriceHistory = pgTable(
  "price_history",
  (t) => ({
    id: t.uuid().notNull().primaryKey().defaultRandom(),
    entityType: t
      .varchar("entity_type", { length: 32 })
      .notNull()
      .$type<PriceHistoryEntity>(),
    entityId: t.uuid("entity_id").notNull(),
    priceCents: t.integer("price_cents").notNull(),
    changedAt: t.timestamp("changed_at").defaultNow().notNull(),
  }),
  (table) => [
    index("price_history_entity_idx").on(
      table.entityType,
      table.entityId,
      table.changedAt,
    ),
  ],
);

/**
 * Coupon: escopo global | product | bundle | product_type.
 * Apenas o target correspondente ao scope é preenchido (valida em aplicação).
 */
export const Coupon = pgTable("coupon", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  code: t.varchar({ length: 64 }).notNull().unique(),
  discountType: t
    .varchar("discount_type", { length: 16 })
    .notNull()
    .$type<CouponDiscountType>(),
  discountValue: t.integer("discount_value").notNull(),
  scope: t.varchar({ length: 32 }).notNull().$type<CouponScope>(),

  targetProductId: t
    .uuid("target_product_id")
    .references(() => Product.id, { onDelete: "cascade" }),
  targetBundleId: t
    .uuid("target_bundle_id")
    .references(() => Bundle.id, { onDelete: "cascade" }),
  targetProductType: t
    .varchar("target_product_type", { length: 32 })
    .$type<ProductType>(),

  validFrom: t.timestamp("valid_from", { withTimezone: true }),
  validTo: t.timestamp("valid_to", { withTimezone: true }),
  maxUses: t.integer("max_uses"),
  usedCount: t.integer("used_count").notNull().default(0),
  active: t.boolean().notNull().default(true),

  createdAt: t.timestamp().defaultNow().notNull(),
}));

/* ────────── relations ────────── */

export const productRelations = relations(Product, ({ many }) => ({
  media: many(ProductMedia),
  bundleItems: many(BundleItem),
}));

export const productMediaRelations = relations(ProductMedia, ({ one }) => ({
  product: one(Product, {
    fields: [ProductMedia.productId],
    references: [Product.id],
  }),
}));

export const stampRelations = relations(Stamp, ({ many }) => ({
  bundles: many(Bundle),
}));

export const bundleRelations = relations(Bundle, ({ one, many }) => ({
  templateBox: one(Product, {
    fields: [Bundle.templateBoxId],
    references: [Product.id],
  }),
  stamp: one(Stamp, {
    fields: [Bundle.stampId],
    references: [Stamp.id],
  }),
  items: many(BundleItem),
  media: many(BundleMedia),
}));

export const bundleMediaRelations = relations(BundleMedia, ({ one }) => ({
  bundle: one(Bundle, {
    fields: [BundleMedia.bundleId],
    references: [Bundle.id],
  }),
}));

export const bundleItemRelations = relations(BundleItem, ({ one }) => ({
  bundle: one(Bundle, {
    fields: [BundleItem.bundleId],
    references: [Bundle.id],
  }),
  product: one(Product, {
    fields: [BundleItem.productId],
    references: [Product.id],
  }),
}));

/* ────────── zod ────────── */

const dimensionsSchema = z.object({
  widthMm: z.number().int().nonnegative().nullable().optional(),
  heightMm: z.number().int().nonnegative().nullable().optional(),
  depthMm: z.number().int().nonnegative().nullable().optional(),
});

export const CreateProductSchema = createInsertSchema(Product, {
  type: z.enum(PRODUCT_TYPES),
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(
      /^[a-z0-9-]+$/,
      "slug deve conter apenas letras minúsculas, números e hifens",
    ),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).nullish(),
  priceCents: z.number().int().nonnegative().nullish(),
  quantity: z.number().int().nonnegative().default(0),
  lowStockThreshold: z.number().int().nonnegative().default(3),
  color: z.string().max(40).nullish(),
  tags: z.array(z.string().min(1).max(40)).default([]),
  paymentMethods: z.array(z.enum(PAYMENT_METHODS)).default([...PAYMENT_METHODS]),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const UpdateProductSchema = createUpdateSchema(Product, {
  type: z.enum(PRODUCT_TYPES).optional(),
  paymentMethods: z.array(z.enum(PAYMENT_METHODS)).optional(),
  tags: z.array(z.string().min(1).max(40)).optional(),
  quantity: z.number().int().nonnegative().optional(),
  lowStockThreshold: z.number().int().nonnegative().optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const CreateProductMediaSchema = createInsertSchema(ProductMedia, {
  url: z.string().url().max(2000),
  kind: z.enum(MEDIA_KINDS),
  alt: z.string().max(200).nullish(),
}).omit({ id: true, createdAt: true });

export const CreateBundleMediaSchema = createInsertSchema(BundleMedia, {
  url: z.string().url().max(2000),
  kind: z.enum(MEDIA_KINDS),
  alt: z.string().max(200).nullish(),
}).omit({ id: true, createdAt: true });

export const CreateStampSchema = createInsertSchema(Stamp, {
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "slug deve conter apenas letras minúsculas, números e hifens"),
  name: z.string().min(1).max(200),
  description: z.string().max(5000).nullish(),
  imageUrl: z.string().url().max(2000).nullish(),
  priceCents: z.number().int().nonnegative().nullish(),
  quantity: z.number().int().nonnegative().default(0),
  lowStockThreshold: z.number().int().nonnegative().default(3),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const UpdateStampSchema = createUpdateSchema(Stamp, {
  imageUrl: z.string().url().max(2000).nullish(),
  priceCents: z.number().int().nonnegative().nullish(),
  quantity: z.number().int().nonnegative().optional(),
  lowStockThreshold: z.number().int().nonnegative().optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const BundleItemInputSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99).default(1),
  sortOrder: z.number().int().nonnegative().default(0),
});

export const CreateBundleSchema = createInsertSchema(Bundle, {
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "slug deve conter apenas letras minúsculas, números e hifens")
    .nullish(),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).nullish(),
  source: z.enum(BUNDLE_SOURCES),
  priceCents: z.number().int().nonnegative().nullish(),
  quantity: z.number().int().nonnegative().default(0),
  lowStockThreshold: z.number().int().nonnegative().default(3),
  customerName: z.string().max(200).nullish(),
  customerNote: z.string().max(2000).nullish(),
})
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({ items: z.array(BundleItemInputSchema).default([]) });

export const UpdateBundleSchema = createUpdateSchema(Bundle, {
  source: z.enum(BUNDLE_SOURCES).optional(),
  priceCents: z.number().int().nonnegative().nullish(),
  quantity: z.number().int().nonnegative().optional(),
  lowStockThreshold: z.number().int().nonnegative().optional(),
})
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({ items: z.array(BundleItemInputSchema).optional() });

export const CreateCouponSchema = createInsertSchema(Coupon, {
  code: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[A-Z0-9_-]+$/, "apenas maiúsculas, dígitos, _ e -"),
  discountType: z.enum(COUPON_DISCOUNT_TYPES),
  discountValue: z.number().int().positive(),
  scope: z.enum(COUPON_SCOPES),
  targetProductId: z.string().uuid().nullish(),
  targetBundleId: z.string().uuid().nullish(),
  targetProductType: z.enum(PRODUCT_TYPES).nullish(),
  maxUses: z.number().int().positive().nullish(),
})
  .omit({ id: true, createdAt: true, usedCount: true })
  .refine(
    (c) => {
      if (c.scope === "global")
        return !c.targetProductId && !c.targetBundleId && !c.targetProductType;
      if (c.scope === "product")
        return !!c.targetProductId && !c.targetBundleId && !c.targetProductType;
      if (c.scope === "bundle")
        return !!c.targetBundleId && !c.targetProductId && !c.targetProductType;
      if (c.scope === "product_type")
        return !!c.targetProductType && !c.targetProductId && !c.targetBundleId;
      return false;
    },
    { message: "target inválido pro scope escolhido" },
  )
  .refine(
    (c) => c.discountType === "fixed" || c.discountValue <= 100,
    { message: "percentual deve ser ≤ 100" },
  );

export const UpdateCouponSchema = createUpdateSchema(Coupon, {
  discountType: z.enum(COUPON_DISCOUNT_TYPES).optional(),
  scope: z.enum(COUPON_SCOPES).optional(),
  targetProductType: z.enum(PRODUCT_TYPES).nullish(),
}).omit({ id: true, createdAt: true });

export { dimensionsSchema };
