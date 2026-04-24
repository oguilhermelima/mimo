"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";
import { AdminNav } from "./admin-nav";
import { BundleForm } from "./bundle-form";
import { BundleMediaManager } from "./bundle-media-manager";

export function BundleEditor({ id }: { id: string }) {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.bundle.adminById.queryOptions({ id }),
  );

  return (
    <section className="space-y-6">
      <header className="space-y-4">
        <h1 className="font-serif text-3xl text-primary">{data.title}</h1>
        <AdminNav />
      </header>
      <BundleForm initial={data} />
      <BundleMediaManager bundleId={data.id} media={data.media} />
    </section>
  );
}
