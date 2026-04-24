import { cn } from "@caixa/ui";

interface LogoProps {
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
  /** "mark" = só o emblema; "wordmark" = só texto; "full" = emblema + wordmark (default). */
  variant?: "mark" | "wordmark" | "full" | "stacked" | "monogram";
  /** Quando true, inclui a tagline "caixinhas artesanais" no wordmark. */
  withTagline?: boolean;
}

export function Logo({
  className,
  markClassName,
  wordmarkClassName,
  variant = "full",
  withTagline = false,
}: LogoProps) {
  const wordmark = (
    <span
      className={cn(
        "inline-flex flex-col items-start leading-none text-primary",
        wordmarkClassName,
      )}
    >
      <span className="font-serif text-2xl italic tracking-tight md:text-3xl">
        encantim
      </span>
      {withTagline && (
        <span className="mt-1 text-[9px] uppercase tracking-[0.42em] text-primary/55 md:text-[10px]">
          caixinhas artesanais
        </span>
      )}
    </span>
  );

  if (variant === "mark") {
    return <LogoMark className={cn("size-10", markClassName, className)} />;
  }
  if (variant === "wordmark") {
    return <span className={cn(className)}>{wordmark}</span>;
  }
  if (variant === "monogram") {
    return <LogoMonogram className={cn("h-8 w-auto", markClassName, className)} />;
  }
  if (variant === "stacked") {
    return (
      <span className={cn("inline-flex flex-col items-center gap-3", className)}>
        <LogoMark className={cn("size-14 shrink-0", markClassName)} />
        <span className="inline-flex flex-col items-center leading-none text-primary">
          <span className="font-serif text-2xl italic tracking-tight md:text-3xl">
            encantim
          </span>
          {withTagline && (
            <span className="mt-1 text-[9px] uppercase tracking-[0.42em] text-primary/55 md:text-[10px]">
              caixinhas artesanais
            </span>
          )}
        </span>
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <LogoMark className={cn("size-10 shrink-0", markClassName)} />
      {wordmark}
    </span>
  );
}

/**
 * Emblema Encantim: laço de fita (o gesto do encantim — embrulhar um presente)
 * com sparkle acima (encanto). Silhueta preenchida em duas opacidades
 * criando hierarquia: laço principal sólido, fitas caindo mais suaves.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      className={cn("text-primary", className)}
      aria-hidden
    >
      {/* === SPARKLE principal + micro-estrelas (encanto) === */}
      <g fill="currentColor">
        <path d="M40 4 L41.6 10.8 L48.4 12.4 L41.6 14 L40 20.8 L38.4 14 L31.6 12.4 L38.4 10.8 Z" />
        <circle cx="27" cy="15" r="1" opacity="0.7" />
        <circle cx="53" cy="15" r="1" opacity="0.7" />
        <circle cx="17" cy="22" r="0.8" opacity="0.55" />
        <circle cx="63" cy="22" r="0.8" opacity="0.55" />
      </g>

      {/* === FITAS CAINDO (streamers) — camada de trás, opacity reduzida === */}
      <g fill="currentColor" fillOpacity="0.9">
        {/* tail esquerda com V-cut */}
        <path d="M 38 52 L 26 74 L 30 70 L 32 75 L 44 54 Z" />
        {/* tail direita com V-cut */}
        <path d="M 42 52 L 54 74 L 50 70 L 48 75 L 36 54 Z" />
      </g>

      {/* === LAÇO (dois loops + nó central) — camada da frente === */}
      {/* loop esquerdo (gota horizontal) */}
      <path
        d="M 40 44
           C 26 34, 12 38, 12 48
           C 12 58, 28 56, 40 50 Z"
        fill="currentColor"
      />
      {/* loop direito (espelhado) */}
      <path
        d="M 40 44
           C 54 34, 68 38, 68 48
           C 68 58, 52 56, 40 50 Z"
        fill="currentColor"
      />

      {/* nó central (rectangle com leve brilho) */}
      <g>
        <rect
          x="35"
          y="41"
          width="10"
          height="13"
          rx="2"
          fill="currentColor"
        />
        {/* highlight vertical sutil no nó */}
        <rect
          x="37"
          y="42.5"
          width="1.8"
          height="10"
          rx="0.5"
          fill="currentColor"
          fillOpacity="0.35"
        />
      </g>

      {/* dobra sutil onde os loops encontram o nó */}
      <g fill="currentColor" fillOpacity="0.3">
        <path d="M 35 44 L 32 46 L 35 48 Z" />
        <path d="M 45 44 L 48 46 L 45 48 Z" />
      </g>
    </svg>
  );
}

/**
 * Versão horizontal inline: laço pequeno + "encantim" italic + linha decorativa.
 * Usada em breadcrumbs, rodapés, divisores.
 */
export function LogoMonogram({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 40"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      className={cn("text-primary", className)}
      aria-hidden
    >
      {/* linha decorativa esquerda */}
      <path
        d="M4 20 H 52"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.4"
      />
      <circle cx="54" cy="20" r="1.2" fill="currentColor" opacity="0.7" />

      {/* laço mini esquerdo */}
      <g transform="translate(58 8)">
        {/* sparkle acima */}
        <path
          d="M10 0 L10.8 3 L13.8 3.7 L10.8 4.4 L10 7.4 L9.2 4.4 L6.2 3.7 L9.2 3 Z"
          fill="currentColor"
        />
        {/* tails */}
        <path
          d="M 8 20 L 4 30 L 6 28 L 7 31 L 10 22 Z"
          fill="currentColor"
          fillOpacity="0.85"
        />
        <path
          d="M 12 20 L 16 30 L 14 28 L 13 31 L 10 22 Z"
          fill="currentColor"
          fillOpacity="0.85"
        />
        {/* loop esquerdo */}
        <path
          d="M 10 17 C 5 13, 1 15, 1 19 C 1 23, 6 23, 10 21 Z"
          fill="currentColor"
        />
        {/* loop direito */}
        <path
          d="M 10 17 C 15 13, 19 15, 19 19 C 19 23, 14 23, 10 21 Z"
          fill="currentColor"
        />
        {/* nó */}
        <rect x="8.5" y="16" width="3" height="5" rx="0.6" fill="currentColor" />
      </g>

      {/* wordmark "encantim" italic centralizado */}
      <g
        style={{
          fontFamily:
            "var(--font-serif), 'Cormorant Garamond', Georgia, serif",
          fontStyle: "italic",
        }}
      >
        <text
          x="104"
          y="28"
          textAnchor="middle"
          fill="currentColor"
          fontSize="22"
          fontWeight="500"
        >
          encantim
        </text>
      </g>

      {/* linha decorativa direita */}
      <circle cx="148" cy="20" r="1.2" fill="currentColor" opacity="0.7" />
      <path
        d="M150 20 H 196"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
}
