import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@caixa/ui/button";

import { BigSparkle, OrnamentalDivider, Petal } from "./ornaments";

export function EncomendaBanner() {
  return (
    <section className="relative mx-auto w-full max-w-7xl px-4 pt-16 sm:px-6 md:px-10 md:pt-24">
      <div className="mb-6 flex flex-col items-center gap-3 text-center md:mb-10">
        <span className="text-[10px] uppercase tracking-[0.32em] text-primary md:text-xs">
          Ou crie a sua
        </span>
        <OrnamentalDivider className="h-3 w-32 text-primary/55 md:w-44" />
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/25 via-accent/30 to-primary/15 p-7 ring-1 ring-primary/30 shadow-2xl shadow-primary/20 md:p-14">
        <div className="pointer-events-none absolute -right-12 -top-12 size-56 rounded-full bg-primary/25 blur-3xl md:size-80" />
        <div className="pointer-events-none absolute -bottom-20 -left-12 size-56 rounded-full bg-accent/40 blur-3xl md:size-80" />

        <BigSparkle
          className="absolute right-[8%] top-[12%] size-4 text-primary/60 md:size-5"
          delay="0s"
        />
        <BigSparkle
          className="absolute left-[6%] top-[24%] size-3 text-primary/50 md:size-4"
          delay="2.4s"
        />
        <BigSparkle
          className="absolute right-[18%] bottom-[14%] size-3 text-primary/55 md:size-4"
          delay="4s"
        />
        <Petal
          variant="b"
          className="animate-drift-up absolute -bottom-2 left-[18%] size-7 text-primary/30 md:size-9"
        />
        <Petal
          variant="a"
          className="animate-drift-down absolute right-[10%] -top-2 size-6 text-primary/25 md:size-8"
          style={{ animationDelay: "3s" }}
        />

        <div className="relative flex flex-col items-start gap-7 md:flex-row md:items-center md:justify-between md:gap-10">
          <div className="max-w-xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-background/70 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-primary ring-1 ring-primary/30 backdrop-blur">
              <Sparkles className="size-3" />
              Feito sob medida
            </span>
            <h2 className="break-words font-serif text-4xl leading-[1.05] text-foreground md:text-5xl lg:text-6xl">
              Monte a sua{" "}
              <em className="text-shimmer font-serif italic">própria</em>
              {" "}caixinha
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
              Escolha a caixa, a estampa e os itens que vão dentro. Reserve
              pelo site e confirmamos cada detalhe pelo WhatsApp.
            </p>
          </div>

          <Button
            asChild
            size="lg"
            className="group w-full gap-2 rounded-full px-7 shadow-lg shadow-primary/30 md:w-auto"
          >
            <Link href="/encomenda">
              Montar a sua caixa
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
