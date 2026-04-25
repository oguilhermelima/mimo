import { cn } from "@caixa/ui";

/**
 * Floreio decorativo (canto). Usa em cantos de molduras de imagem.
 * Origem no canto superior-esquerdo; use rotação via Tailwind pra girar.
 */
export function CornerFlourish({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-primary", className)}
      aria-hidden
    >
      <path
        d="M2 2 C 14 4, 22 12, 24 24 M 2 2 C 4 14, 12 22, 24 24"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.65"
      />
      <circle cx="2" cy="2" r="1.5" fill="currentColor" />
      <circle cx="14" cy="6" r="1" fill="currentColor" opacity="0.7" />
      <circle cx="6" cy="14" r="1" fill="currentColor" opacity="0.7" />
      <path
        d="M26 24 l-2 2 l2 2 l2 -2 z"
        fill="currentColor"
        opacity="0.5"
      />
    </svg>
  );
}

/**
 * Divisor ornamental pra títulos de seção: linha — estrela — linha.
 */
export function OrnamentalDivider({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-4 w-48 text-primary/70", className)}
      aria-hidden
    >
      <path d="M2 10 H80" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M120 10 H198" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <g transform="translate(100 10)">
        <path
          d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2 Z"
          fill="currentColor"
        />
      </g>
      <circle cx="82" cy="10" r="1.5" fill="currentColor" />
      <circle cx="118" cy="10" r="1.5" fill="currentColor" />
    </svg>
  );
}

/** Pétala que flutua. Usa posição absoluta do pai + anim `animate-float-tilt`. */
export function Petal({
  className,
  variant = "a",
  style,
}: {
  className?: string;
  variant?: "a" | "b" | "c";
  style?: React.CSSProperties;
}) {
  const paths = {
    a: "M12 2 C 18 4, 22 10, 12 22 C 2 10, 6 4, 12 2 Z",
    b: "M12 2 C 20 6, 18 14, 12 22 C 6 14, 4 6, 12 2 Z",
    c: "M12 3 C 17 5, 20 12, 14 21 C 8 16, 5 8, 12 3 Z",
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary/40", className)}
      style={style}
      aria-hidden
    >
      <path d={paths[variant]} fill="currentColor" />
      <path
        d={paths[variant]}
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.6"
      />
    </svg>
  );
}

/** Ruído/granulado sutil — SVG filter reutilizável como overlay. */
export function GrainOverlay({ className }: { className?: string }) {
  return (
    <svg
      className={cn(
        "pointer-events-none absolute inset-0 size-full opacity-[0.12] mix-blend-overlay",
        className,
      )}
      aria-hidden
    >
      <filter id="caixa-grain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="1.6"
          numOctaves="2"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#caixa-grain)" />
    </svg>
  );
}

/**
 * Lacre de cera dourado — selo de carta. Circular, com inicial "E" embossada.
 * Use absolute + rotação leve para overhang em cards.
 */
export function WaxSeal({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("drop-shadow-md", className)}
      aria-hidden
    >
      <defs>
        <radialGradient id="wax-body" cx="38%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#e9c987" />
          <stop offset="45%" stopColor="#c89a4a" />
          <stop offset="80%" stopColor="#8a5d20" />
          <stop offset="100%" stopColor="#4a300d" />
        </radialGradient>
      </defs>
      <path
        d="M32 3 C 47 2, 60 13, 61 28 C 63 38, 58 50, 49 57 C 41 62, 30 61, 22 58 C 11 55, 3 44, 4 30 C 3 15, 17 4, 32 3 Z"
        fill="url(#wax-body)"
      />
      <circle
        cx="32"
        cy="32"
        r="18"
        fill="none"
        stroke="#2c1c06"
        strokeOpacity="0.4"
        strokeWidth="0.6"
      />
      <text
        x="32"
        y="41"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontStyle="italic"
        fontSize="24"
        fontWeight="600"
        fill="#2c1c06"
        fillOpacity="0.65"
      >
        E
      </text>
      <ellipse cx="22" cy="19" rx="8" ry="3.5" fill="white" fillOpacity="0.22" />
    </svg>
  );
}

/**
 * Fita washi — strip translúcida com listras sutis e bordas levemente irregulares.
 * Use com rotação. preserveAspectRatio=none deixa esticar.
 */
export function WashiTape({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 24"
      preserveAspectRatio="none"
      className={cn("text-primary", className)}
      aria-hidden
    >
      <defs>
        <pattern
          id="washi-stripes"
          width="8"
          height="24"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(0)"
        >
          <rect width="8" height="24" fill="currentColor" fillOpacity="0.55" />
          <rect width="2" height="24" fill="currentColor" fillOpacity="0.85" />
          <rect x="4" width="1" height="24" fill="white" fillOpacity="0.25" />
        </pattern>
      </defs>
      <path
        d="M0 3 Q 6 0 12 2 T 24 2 T 36 3 T 48 1 T 60 3 T 72 2 T 84 3 T 96 1 T 108 3 T 120 2
           L 120 22 Q 114 24 108 22 T 96 22 T 84 23 T 72 21 T 60 23 T 48 22 T 36 23 T 24 21 T 12 23 T 0 22 Z"
        fill="url(#washi-stripes)"
      />
    </svg>
  );
}

/** Brilho animado em forma de estrela de 4 pontas (para sparkles importantes). */
export function BigSparkle({
  className,
  delay = "0s",
}: {
  className?: string;
  delay?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="currentColor"
      className={cn("animate-twinkle", className)}
      style={{ animationDelay: delay }}
      aria-hidden
    >
      <path d="M16 0 L18 14 L32 16 L18 18 L16 32 L14 18 L0 16 L14 14 Z" />
    </svg>
  );
}

/** Sparkle de 4 pontas estático (sem animação própria — usa animação do pai). */
function SparkleShape({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M16 0 L18 14 L32 16 L18 18 L16 32 L14 18 L0 16 L14 14 Z" />
    </svg>
  );
}

/**
 * Overlay mágico para hover: sparkles que pipocam em posições aleatórias +
 * um brilho diagonal sweep. Deve ser filho direto de um elemento com `group`.
 * Usa opacity/scale 0 no estado base e anima ao entrar hover.
 */
export function GlitterOverlay({ className }: { className?: string }) {
  const sparkles: {
    top: string;
    left: string;
    size: string;
    delay: string;
    duration: string;
    opacity: string;
  }[] = [
    { top: "12%", left: "18%", size: "0.9rem", delay: "0ms", duration: "2.4s", opacity: "1" },
    { top: "22%", left: "76%", size: "1.1rem", delay: "180ms", duration: "2.2s", opacity: "0.9" },
    { top: "48%", left: "14%", size: "0.7rem", delay: "380ms", duration: "2.6s", opacity: "0.85" },
    { top: "64%", left: "82%", size: "0.95rem", delay: "260ms", duration: "2.3s", opacity: "0.95" },
    { top: "82%", left: "34%", size: "0.7rem", delay: "520ms", duration: "2.5s", opacity: "0.8" },
    { top: "30%", left: "48%", size: "0.55rem", delay: "640ms", duration: "2.1s", opacity: "0.7" },
  ];
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      aria-hidden
    >
      {/* shine sweep — barra diagonal de luz que passa */}
      <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute -inset-y-8 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover:animate-shine-sweep" />
      </div>

      {/* sparkles posicionados */}
      {sparkles.map((s, i) => (
        <span
          key={i}
          className="absolute block text-primary-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:[animation-play-state:running]"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            animation: `sparkle-pop ${s.duration} ease-in-out ${s.delay} infinite`,
            animationPlayState: "paused",
            color: "var(--color-primary-foreground, white)",
            opacity: 0,
          }}
        >
          <SparkleShape className="size-full drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]" />
        </span>
      ))}

      {/* halo rosado/sage sutil */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-accent/30 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </div>
  );
}
