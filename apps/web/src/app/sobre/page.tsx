import Image from "next/image";
import Link from "next/link";

import { Button } from "@caixa/ui/button";

import { LogoMonogram } from "~/components/logo";
import {
  BigSparkle,
  OrnamentalDivider,
  Petal,
} from "~/components/ornaments";

export const metadata = {
  title: "sobre",
  description:
    "Encantim — ateliê de caixinhas artesanais feitas à mão, para presentear com alma.",
};

export default function SobrePage() {
  return (
    <section className="relative overflow-hidden">
      <BackgroundWash />

      <div className="relative mx-auto w-full max-w-3xl px-6 py-16 md:px-10 md:py-24">
        <header className="flex flex-col items-center gap-5 text-center">
          <p className="text-[10px] uppercase tracking-[0.5em] text-primary/70 md:text-xs">
            Bem-vinda ao
          </p>
          <h1 className="font-serif text-6xl leading-[0.95] text-foreground md:text-7xl lg:text-8xl">
            <span className="italic">Encantim</span>
          </h1>

          <OrnamentalDivider className="h-6 w-48 text-primary/70 md:w-56" />

          <p className="font-serif text-2xl italic text-primary md:text-3xl">
            Ateliê
          </p>

          <div className="mx-auto h-px w-16 bg-primary/40" />

          <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground md:text-xs">
            Caixinhas Artesanais Feitas à Mão
          </p>
        </header>

        <div className="mt-14 space-y-12 md:mt-20">
          <p className="mx-auto max-w-xl text-center text-base leading-relaxed text-foreground/90 md:text-lg md:leading-loose">
            Aqui, cada caixinha nasce devagar — como quem borda uma lembrança.
            São papéis escolhidos um a um, fitas finas e o tempo certo pra cada
            detalhe encontrar seu lugar. No{" "}
            <em className="font-serif not-italic text-primary">Encantim</em>,
            nada é apressado: porque presentear, pra gente, é um gesto que
            atravessa anos.
          </p>

          <figure className="relative mx-auto max-w-lg">
            <BigSparkle
              className="absolute -left-4 -top-4 size-5 text-primary md:-left-6 md:-top-6 md:size-7"
              delay="0s"
            />
            <BigSparkle
              className="absolute -right-3 -bottom-3 size-4 text-primary/80 md:-right-5 md:-bottom-5 md:size-6"
              delay="1.4s"
            />
            <blockquote className="relative mx-auto text-balance font-serif text-2xl italic leading-relaxed text-primary md:text-3xl md:leading-snug">
              <span className="text-shimmer">Você merece um presente</span>{" "}
              que fale ao coração.
            </blockquote>
          </figure>

          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted/50 shadow-xl shadow-primary/10 ring-1 ring-border/40">
            <Image
              src="/caixas/caixa-17.jpeg"
              alt="Caixinha artesanal Encantim com laço e bilhete"
              fill
              sizes="(min-width: 768px) 42rem, 90vw"
              priority
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent" />
          </div>

          <p className="mx-auto max-w-xl text-center text-base leading-relaxed text-foreground/90 md:text-lg md:leading-loose">
            Amarramos cada laço como quem entrega um segredo. As nossas
            caixinhas não são só embrulho — são memória feita à mão, prontinha
            pra atravessar o tempo no cantinho mais especial de alguém que
            você ama.
          </p>
        </div>

        <footer className="mt-20 flex flex-col items-center gap-8 text-center">
          <LogoMonogram className="h-6 w-auto text-primary/60 md:h-8" />
          <p className="max-w-sm text-sm text-muted-foreground">
            Feito peça por peça, sob encomenda, para presentear com alma.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-full px-7">
              <Link href="/produtos">Ver o catálogo</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-7">
              <Link href="/encomenda">Montar sua caixinha</Link>
            </Button>
          </div>
        </footer>
      </div>
    </section>
  );
}

function BackgroundWash() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/20" />
      <div className="absolute -left-24 top-1/4 size-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -right-24 top-2/3 size-96 rounded-full bg-accent/40 blur-3xl" />
      <Petal
        variant="a"
        className="absolute left-[3%] top-[10%] size-10 text-primary/25 md:size-14"
      />
      <Petal
        variant="b"
        className="absolute right-[5%] top-[32%] size-12 text-primary/20 md:size-16"
        style={{ animationDelay: "2s" }}
      />
      <Petal
        variant="c"
        className="absolute left-[6%] top-[60%] size-10 text-primary/25 md:size-12"
        style={{ animationDelay: "4s" }}
      />
      <Petal
        variant="a"
        className="absolute right-[4%] top-[82%] size-10 text-primary/20 md:size-14"
        style={{ animationDelay: "1s" }}
      />
    </div>
  );
}
