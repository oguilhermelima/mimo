import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircleHeart, PenLine, Scissors } from "lucide-react";

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

const PROCESS_STEPS = [
  {
    icon: MessageCircleHeart,
    title: "Conversa íntima",
    body: "Tudo começa pelo WhatsApp. Quem vai receber? Qual a história entre vocês? Antes do papel, vem a escuta — porque cada caixinha começa em quem inspira ela.",
  },
  {
    icon: Heart,
    title: "Papéis escolhidos",
    body: "Selecionamos papéis, fitas, pérolas e lacres com cuidado, peça por peça. Nada é pré-fabricado: cada combinação nasce em função da pessoa que vai abrir.",
  },
  {
    icon: Scissors,
    title: "Mãos no atelier",
    body: "Recortamos, dobramos e aplicamos cada detalhe à mão. Cada laço, cada dobra, cada aplicação ganha o zelo que merece — sem etapa pulada.",
  },
  {
    icon: PenLine,
    title: "Bilhete & entrega",
    body: "Antes de fechar, escrevemos um bilhete à mão. Lacramos, amarramos a fita e deixamos pronta para atravessar o tempo no cantinho de quem você ama.",
  },
];

export default function SobrePage() {
  return (
    <section className="relative overflow-hidden">
      <BackgroundWash />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-16 md:px-10 md:py-24">
        <header className="flex flex-col items-center gap-5 text-center">
          <p className="text-[10px] uppercase tracking-[0.5em] text-primary/70 md:text-xs">
            Bem-vinda(o) ao
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

        <div className="mt-14 md:mt-20">
          <p className="mx-auto max-w-2xl text-center text-base leading-relaxed text-foreground/90 md:text-lg md:leading-loose">
            Aqui, cada caixinha nasce com cuidado — como quem borda uma
            lembrança. São papéis escolhidos um a um, fitas finas e atenção
            em cada detalhe. No{" "}
            <em className="font-serif not-italic text-primary">Encantim</em>,
            todo presente recebe o mesmo zelo: porque presentear, pra gente,
            é um gesto que atravessa anos.
          </p>
        </div>

        <div className="mt-20 md:mt-28">
          <div className="mb-10 flex flex-col items-center gap-4 text-center md:mb-14">
            <span className="text-[10px] uppercase tracking-[0.32em] text-primary/80 md:text-xs">
              Do papel ao laço
            </span>
            <h2 className="font-serif text-3xl leading-tight text-foreground md:text-5xl">
              Como nasce uma caixinha
            </h2>
            <OrnamentalDivider className="h-3 w-32 text-primary/55 md:w-40" />
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Quatro etapas — todas com a mesma atenção. Cada caixinha passa
              por essas mãos antes de chegar nas suas.
            </p>
          </div>

          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <li
                  key={step.title}
                  className="group relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-background via-background to-primary/5 p-6 transition hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 md:p-7"
                >
                  <div className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-primary/8 blur-2xl transition group-hover:bg-primary/15 md:size-32" />
                  <div className="relative flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-3xl italic text-primary/40 md:text-4xl">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20 transition group-hover:bg-primary/15">
                        <Icon className="size-5" />
                      </span>
                    </div>
                    <h3 className="font-serif text-xl text-foreground md:text-2xl">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                      {step.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <figure className="mt-20 md:mt-28">
          <BigSparkle
            className="absolute -left-4 -top-4 size-5 text-primary md:-left-6 md:-top-6 md:size-7"
            delay="0s"
          />
          <BigSparkle
            className="absolute -right-3 -bottom-3 size-4 text-primary/80 md:-right-5 md:-bottom-5 md:size-6"
            delay="1.4s"
          />
          <blockquote className="mx-auto max-w-3xl text-center text-balance font-serif text-2xl italic leading-relaxed text-primary md:text-4xl md:leading-snug">
            <span className="text-shimmer">Você merece um presente</span>{" "}
            que fale ao coração.
          </blockquote>
        </figure>

        <div className="mt-20 grid items-center gap-12 md:mt-28 md:grid-cols-[1.1fr_1fr] md:gap-16">
          <div className="relative h-[26rem] w-full md:h-[34rem]">
            <BigSparkle
              className="absolute -left-2 top-2 z-20 size-5 text-primary/55 md:-left-4 md:size-7"
              delay="0s"
            />
            <BigSparkle
              className="absolute right-4 top-1/3 z-20 size-4 text-primary/45 md:right-6 md:size-5"
              delay="2.2s"
            />
            <BigSparkle
              className="absolute -bottom-2 left-1/3 z-20 size-3 text-primary/45 md:size-4"
              delay="4.4s"
            />

            <div className="absolute right-0 top-0 z-10 w-[58%] rotate-[2.5deg] transform-gpu rounded-sm bg-[#f3e7c8] p-2.5 ring-1 ring-black/15 shadow-2xl md:w-[55%] md:p-3">
              <div className="relative aspect-[4/5] overflow-hidden ring-1 ring-black/10">
                <Image
                  src="/catalogo/sabedoria-1.jpeg"
                  alt="Caixa Sabedoria aberta com Bíblia"
                  fill
                  sizes="(min-width: 768px) 22rem, 60vw"
                  priority
                  className="object-cover"
                />
              </div>
              <p className="mt-2 text-center font-serif text-[9px] uppercase tracking-[0.3em] text-[#75541e] md:text-[10px]">
                Sabedoria · Atelier
              </p>
            </div>

            <div className="absolute left-0 top-20 z-20 w-[52%] -rotate-[3deg] transform-gpu rounded-sm bg-[#fce4e0] p-2 ring-1 ring-black/10 shadow-xl md:left-2 md:top-32 md:w-[48%] md:p-2.5">
              <div className="relative aspect-square overflow-hidden ring-1 ring-black/10">
                <Image
                  src="/catalogo/melodia-rosas-1.jpeg"
                  alt="Caixa Melodia de Rosas com colar"
                  fill
                  sizes="(min-width: 768px) 18rem, 50vw"
                  className="object-cover"
                />
              </div>
              <p className="mt-2 text-center font-serif text-[9px] uppercase tracking-[0.3em] text-[#a86b6b] md:text-[10px]">
                Melodia · No. 04
              </p>
            </div>

            <div className="absolute bottom-0 right-12 z-30 w-[36%] rotate-[5deg] transform-gpu rounded-sm bg-[#fdfaee] p-1.5 ring-1 ring-black/10 shadow-xl md:right-20 md:w-[32%] md:p-2">
              <div className="relative aspect-square overflow-hidden ring-1 ring-black/10">
                <Image
                  src="/catalogo/mini-rosa-1.jpeg"
                  alt="Mini Rosa caixinha aberta"
                  fill
                  sizes="(min-width: 768px) 12rem, 36vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <span className="text-[10px] uppercase tracking-[0.32em] text-primary/80 md:text-xs">
              Edição limitada
            </span>
            <h2 className="font-serif text-3xl leading-tight text-foreground md:text-5xl">
              Cada caixinha é{" "}
              <em className="text-shimmer font-serif italic">única</em>
            </h2>
            <p className="text-base leading-relaxed text-foreground/85 md:text-lg md:leading-loose">
              Mesmo os modelos do catálogo passam por escolhas pessoais — papel,
              fita, conteúdo, mensagem. Por isso fazemos sob encomenda: cada
              presente recebe o mesmo zelo, e é o zelo que separa um embrulho
              de uma lembrança.
            </p>
            <p className="text-base leading-relaxed text-foreground/85 md:text-lg md:leading-loose">
              Amarramos cada laço como quem entrega um segredo. As nossas
              caixinhas não são só embrulho — são memória feita à mão, prontinha
              pra atravessar o tempo no cantinho mais especial de alguém que
              você ama.
            </p>
          </div>
        </div>

        <footer className="mt-24 flex flex-col items-center gap-8 text-center md:mt-32">
          <LogoMonogram className="h-6 w-auto text-primary/60 md:h-8" />
          <OrnamentalDivider className="h-4 w-40 text-primary/50" />
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
            Feito peça por peça, sob encomenda, para presentear com alma. Cada
            caixinha é única — assim como a história que ela carrega.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-full px-7 shadow-lg shadow-primary/25">
              <Link href="/produtos">Ver os Presentes</Link>
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
