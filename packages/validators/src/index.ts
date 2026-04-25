import { z } from "zod/v4";

import { FULFILLMENT_METHODS, PAYMENT_METHODS } from "@caixa/db/schema";

export * from "./auth";

const customBoxItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
});

export type CustomBoxItem = z.infer<typeof customBoxItemSchema>;

const customBoxCompositionSchema = z.object({
  templateBoxId: z.string().uuid(),
  stampId: z.string().uuid().nullable(),
  items: z.array(customBoxItemSchema).min(1),
});

export type CustomBoxComposition = z.infer<typeof customBoxCompositionSchema>;

/**
 * Cart items: product avulso, bundle do catálogo, OU caixa montada (custom_box).
 * Encomenda agora vai pro carrinho e finaliza no /checkout.
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
  z.object({
    kind: z.literal("custom_box"),
    customBox: customBoxCompositionSchema,
    quantity: z.number().int().min(1).max(99),
  }),
]);

export type CartItem = z.infer<typeof cartItemSchema>;

/**
 * Checkout: payload pra order.create. fulfillmentMethod determina se addressId é exigido.
 * Pickup local em Taboão da Serra-SP é combinado por WhatsApp depois — não precisa endereço aqui.
 */
export const checkoutSchema = z
  .object({
    items: z.array(cartItemSchema).min(1),
    fulfillmentMethod: z.enum(FULFILLMENT_METHODS),
    addressId: z.string().uuid().nullable(),
    paymentMethod: z.enum(PAYMENT_METHODS),
    customerNote: z.string().max(2000).optional(),
    couponCode: z.string().max(64).optional(),
  })
  .refine(
    (v) =>
      v.fulfillmentMethod === "pickup_taboao" ||
      (v.fulfillmentMethod === "delivery" && !!v.addressId),
    { message: "endereço é obrigatório quando o método é entrega" },
  );

export type Checkout = z.infer<typeof checkoutSchema>;

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  phone: z
    .string()
    .transform((v) => v.replace(/\D+/g, ""))
    .refine((v) => v.length === 0 || v.length === 10 || v.length === 11, {
      message: "telefone deve ter DDD + número",
    })
    .optional(),
  cpf: z
    .string()
    .transform((v) => v.replace(/\D+/g, ""))
    .refine((v) => v.length === 0 || v.length === 11, {
      message: "CPF deve ter 11 dígitos",
    })
    .optional(),
  image: z.string().url().max(2000).nullish(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
