import { cn } from "@caixa/ui";

function Block({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/70",
        className,
      )}
    />
  );
}

export function CatalogGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul className="mx-auto grid max-w-2xl grid-cols-1 gap-8 sm:max-w-none sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <li
          key={i}
          className="animate-fade-slide-up"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <Block className="aspect-[4/5] w-full rounded-2xl" />
          <div className="mt-4 space-y-2 px-1">
            <Block className="h-5 w-3/4 rounded-full" />
            <Block className="h-6 w-1/3 rounded-full" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ProductsPageSkeleton() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Block className="h-12 w-56 rounded-full" />
        <Block className="h-4 w-80 rounded-full" />
      </header>
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden space-y-6 lg:block">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Block className="h-3 w-20 rounded-full" />
              <Block className="h-10 w-full rounded-full" />
            </div>
          ))}
        </aside>
        <section>
          <Block className="mb-4 h-4 w-24 rounded-full" />
          <CatalogGridSkeleton count={6} />
        </section>
      </div>
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-10 md:grid-cols-2">
        <Block className="aspect-[4/5] w-full rounded-3xl" />
        <div className="flex flex-col gap-5">
          <div className="space-y-3">
            <Block className="h-10 w-5/6 rounded-lg" />
            <Block className="h-10 w-2/3 rounded-lg" />
          </div>
          <Block className="h-9 w-40 rounded-full" />
          <div className="space-y-2">
            <Block className="h-4 w-full rounded-full" />
            <Block className="h-4 w-11/12 rounded-full" />
            <Block className="h-4 w-4/5 rounded-full" />
          </div>
          <Block className="h-24 w-full rounded-2xl" />
          <Block className="h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function EncomendaSkeleton() {
  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <Block className="h-12 w-72 rounded-lg" />
        <Block className="h-4 w-96 max-w-full rounded-full" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Block key={i} className="h-7 w-24 rounded-full" />
          ))}
        </div>
      </header>
      <CatalogGridSkeleton count={3} />
    </div>
  );
}

export function ListTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <section className="space-y-6">
      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Block className="h-8 w-40 rounded-lg" />
            <Block className="h-3 w-64 rounded-full" />
          </div>
          <Block className="h-10 w-32 rounded-full" />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Block key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
      </header>
      <div className="space-y-2 rounded-2xl bg-card p-4 ring-1 ring-border/40">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center gap-3 border-b border-border/30 py-3 last:border-b-0"
          >
            <Block className="h-5 w-4/5 rounded-full" />
            <Block className="h-4 w-24 rounded-full" />
            <Block className="h-4 w-16 rounded-full" />
            <Block className="h-6 w-20 rounded-full" />
            <Block className="h-5 w-14 rounded-full" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function FormSkeleton() {
  return (
    <section className="space-y-6">
      <header className="space-y-4">
        <Block className="h-8 w-48 rounded-lg" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Block key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
      </header>
      <div className="space-y-6 rounded-2xl bg-card p-6 ring-1 ring-border/40">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Block className="h-3 w-20 rounded-full" />
              <Block className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Block className="h-3 w-20 rounded-full" />
              <Block className="h-10 w-full rounded-md" />
            </div>
          </div>
        ))}
        <Block className="h-10 w-28 rounded-full" />
      </div>
    </section>
  );
}

export function SimpleTextSkeleton() {
  return (
    <div className="space-y-3">
      <Block className="h-4 w-1/3 rounded-full" />
      <Block className="h-4 w-2/3 rounded-full" />
      <Block className="h-4 w-1/2 rounded-full" />
    </div>
  );
}
