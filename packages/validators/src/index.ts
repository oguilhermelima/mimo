import { z } from "zod/v4";

import { PAYMENT_METHODS } from "@caixa/db/schema";

/**
 * Cart items: product standalone OU bundle (caixa pronta).
 * Encomenda (user_order bundle) não passa pelo cart — criada direto em /encomenda.
 */
export const cartItemSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("product"),
    productId: z.string().uuid(),
    quantity: z.number().int().min(1).max(99),
  }),
  z.object({
    kind: z.literal("bundle"),
    bundleId: z.string().uuid(),
    quantity: z.number().int().min(1).max(99),
  }),
]);

export type CartItem = z.infer<typeof cartItemSchema>;

export const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1),
  paymentMethod: z.enum(PAYMENT_METHODS),
  notes: z.string().max(1000).optional(),
  couponCode: z.string().max(64).optional(),
});

export type Checkout = z.infer<typeof checkoutSchema>;

/**
 * Encomenda: usuário escolhe shell + estampa + items.
 * Server cria Bundle(source='user_order'), grava items, e monta link WhatsApp.
 */
export const customOrderSchema = z.object({
  templateBoxId: z.string().uuid(),
  stampId: z.string().uuid().nullable(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1),
  customerName: z.string().min(1).max(200),
  customerNote: z.string().max(2000).optional(),
  paymentMethod: z.enum(PAYMENT_METHODS),
});

export type CustomOrderInput = z.infer<typeof customOrderSchema>;
