"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";
import { MediaManager } from "./media-manager";
import { ProductForm } from "./product-form";

export function ProductEditor({ id }: { id: string }) {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.product.adminById.queryOptions({ id }),
  );

  return (
    <section className="space-y-8">
      <h1 className="font-serif text-3xl text-primary">{data.title}</h1>
      <ProductForm initial={data} />
      <MediaManager productId={data.id} media={data.media} />
    </section>
  );
}
