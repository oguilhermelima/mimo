"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";
import { AdminNav } from "./admin-nav";
import { CouponForm } from "./coupon-form";

export function CouponEditor({ id }: { id: string }) {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.coupon.adminById.queryOptions({ id }),
  );

  return (
    <section className="space-y-6">
      <header className="space-y-4">
        <h1 className="font-serif text-3xl text-primary">{data.code}</h1>
        <AdminNav />
      </header>
      <CouponForm initial={data} />
    </section>
  );
}
