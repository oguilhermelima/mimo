import { z } from "zod/v4";

import { PAYMENT_METHODS } from "@caixa/db/schema";

export const cartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
  /** opcional: ids dos filhos inclusos quando a caixa é montada */
  children: z.array(z.string().uuid()).default([]),
});

export type CartItem = z.infer<typeof cartItemSchema>;

export const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1),
  paymentMethod: z.enum(PAYMENT_METHODS),
  notes: z.string().max(1000).optional(),
});

export type Checkout = z.infer<typeof checkoutSchema>;
