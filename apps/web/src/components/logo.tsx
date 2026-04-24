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
      <span className="font-serif text-2xl italic tracking-tight md:text-[1.75rem]">
        encantim
      </span>
      {withTagline && (
        <span className="mt-1.5 text-[9px] uppercase tracking-[0.42em] text-primary/55 md:text-[10px]">
          caixinhas artesanais
        </span>
      )}
    </span>
  );

  if (variant === "mark") {
    return <LogoMark className={cn("size-9", markClassName, className)} />;
  }
  if (variant === "wordmark") {
    return <span className={cn(className)}>{wordmark}</span>;
  }
  if (variant === "monogram") {
    return (
      <LogoMonogram className={cn("h-8 w-auto", markClassName, className)} />
    );
  }
  if (variant === "stacked") {
    return (
      <span
        className={cn("inline-flex flex-col items-center gap-3", className)}
      >
        <LogoMark className={cn("size-12 shrink-0", markClassName)} />
        <span className="inline-flex flex-col items-center leading-none text-primary">
          <span className="font-serif text-2xl italic tracking-tight md:text-[1.75rem]">
            encantim
          </span>
          {withTagline && (
            <span className="mt-1.5 text-[9px] uppercase tracking-[0.42em] text-primary/55 md:text-[10px]">
              caixinhas artesanais
            </span>
          )}
        </span>
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={cn("size-8 shrink-0", markClassName)} />
      {wordmark}
    </span>
  );
}

/**
 * Emblema Encantim: uma estrela de 4 pontas (sparkle — encanto)
 * com duas satélites pequenas em diagonal oposta. Minimalista e feminino.
 * Puro fill, sem strokes, leitura limpa em qualquer tamanho.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      className={cn("text-primary", className)}
      aria-hidden
    >
      {/* estrela principal — 4 pontas pontudas */}
      <path
        d="M20 2 L22.6 16.4 L37 19 L22.6 21.6 L20 36 L17.4 21.6 L3 19 L17.4 16.4 Z"
        fill="currentColor"
      />
      {/* sparkle satélite — canto superior esquerdo */}
      <path
        d="M8 7 L8.7 9.3 L11 10 L8.7 10.7 L8 13 L7.3 10.7 L5 10 L7.3 9.3 Z"
        fill="currentColor"
        fillOpacity="0.55"
      />
      {/* sparkle satélite — canto inferior direito */}
      <path
        d="M32 27 L32.5 28.7 L34.2 29.2 L32.5 29.7 L32 31.4 L31.5 29.7 L29.8 29.2 L31.5 28.7 Z"
        fill="currentColor"
        fillOpacity="0.55"
      />
    </svg>
  );
}

/**
 * Versão horizontal inline: sparkle + "encantim" italic + sparkle.
 * Usada em breadcrumbs, rodapés, separadores.
 */
export function LogoMonogram({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 32"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      className={cn("text-primary", className)}
      aria-hidden
    >
      {/* linha fina esquerda */}
      <path
        d="M4 16 H 38"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.4"
      />

      {/* sparkle esquerdo */}
      <g transform="translate(48 16)">
        <path
          d="M0 -10 L1.6 -1.6 L10 0 L1.6 1.6 L0 10 L-1.6 1.6 L-10 0 L-1.6 -1.6 Z"
          fill="currentColor"
        />
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
          x="110"
          y="22"
          textAnchor="middle"
          fill="currentColor"
          fontSize="21"
          fontWeight="500"
        >
          encantim
        </text>
      </g>

      {/* sparkle direito */}
      <g transform="translate(172 16)">
        <path
          d="M0 -10 L1.6 -1.6 L10 0 L1.6 1.6 L0 10 L-1.6 1.6 L-10 0 L-1.6 -1.6 Z"
          fill="currentColor"
        />
      </g>

      {/* linha fina direita */}
      <path
        d="M182 16 H 216"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
}
