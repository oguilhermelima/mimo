import { Suspense } from "react";

import { OrderDetail } from "~/components/order-detail";
import { ListTableSkeleton } from "~/components/skeletons";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";

export const metadata = { title: "pedido" };

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  prefetch(trpc.order.byId.queryOptions({ id }));

  return (
    <HydrateClient>
      <section className="mx-auto w-full max-w-3xl px-6 py-10 md:px-10 md:py-16">
        <Suspense fallback={<ListTableSkeleton />}>
          <OrderDetail id={id} />
        </Suspense>
      </section>
    </HydrateClient>
  );
}
