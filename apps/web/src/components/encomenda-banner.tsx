import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@caixa/ui/button";

export function EncomendaBanner() {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 pt-10 md:px-10 md:pt-16">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10 p-8 ring-1 ring-primary/30 md:p-12">
        <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-primary/20 blur-3xl md:size-72" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 size-48 rounded-full bg-accent/30 blur-3xl md:size-72" />

        <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-background/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-primary ring-1 ring-primary/30 backdrop-blur">
              <Sparkles className="size-3" />
              feito sob medida
            </span>
            <h2 className="font-serif text-3xl leading-tight text-foreground md:text-4xl">
              monte a sua própria caixinha
            </h2>
            <p className="text-muted-foreground md:text-lg">
              escolha a caixa crua, a estampa e os itens que você quer dentro —
              fechamos tudo no WhatsApp com carinho.
            </p>
          </div>

          <Button asChild size="lg" className="group gap-2 rounded-full px-7 shadow-lg shadow-primary/25">
            <Link href="/encomenda">
              Começar encomenda
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
