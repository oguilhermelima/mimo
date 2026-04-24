"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";
import { AdminNav } from "./admin-nav";
import { StampForm } from "./stamp-form";

export function StampEditor({ id }: { id: string }) {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.stamp.adminById.queryOptions({ id }),
  );

  return (
    <section className="space-y-6">
      <header className="space-y-4">
        <h1 className="font-serif text-3xl text-primary">{data.name}</h1>
        <AdminNav />
      </header>
      <StampForm initial={data} />
    </section>
  );
}
