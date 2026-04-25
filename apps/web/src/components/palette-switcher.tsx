"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@caixa/ui";

import { Sheet } from "./sheet";

type Palette =
  | "salvia"
  | "oliva"
  | "eucalipto"
  | "jade"
  | "terracota"
  | "pessego"
  | "mel"
  | "coral"
  | "salmao"
  | "rosa"
  | "blush"
  | "lavanda"
  | "berinjela"
  | "bordo";

const PALETTE_IDS: Palette[] = [
  "salvia",
  "oliva",
  "eucalipto",
  "jade",
  "terracota",
  "pessego",
  "mel",
  "coral",
  "salmao",
  "rosa",
  "blush",
  "lavanda",
  "berinjela",
  "bordo",
];

type Group = "verde" | "quente" | "afetivo" | "premium";

const PALETTES: {
  id: Palette;
  label: string;
  hint: string;
  group: Group;
  swatches: [string, string, string];
}[] = [
  {
    id: "salvia",
    label: "Sálvia",
    hint: "atual · botânico zen",
    group: "verde",
    swatches: [
      "oklch(0.985 0.006 95)",
      "oklch(0.44 0.055 140)",
      "oklch(0.92 0.03 135)",
    ],
  },
  {
    id: "oliva",
    label: "Oliva",
    hint: "verde quente · terroso",
    group: "verde",
    swatches: [
      "oklch(0.98 0.012 95)",
      "oklch(0.5 0.085 112)",
      "oklch(0.88 0.05 90)",
    ],
  },
  {
    id: "eucalipto",
    label: "Eucalipto",
    hint: "verde fresco · delicado",
    group: "verde",
    swatches: [
      "oklch(0.985 0.008 170)",
      "oklch(0.54 0.06 175)",
      "oklch(0.88 0.04 170)",
    ],
  },
  {
    id: "jade",
    label: "Jade",
    hint: "verde joia · vibrante",
    group: "verde",
    swatches: [
      "oklch(0.985 0.008 155)",
      "oklch(0.5 0.09 160)",
      "oklch(0.86 0.06 155)",
    ],
  },
  {
    id: "terracota",
    label: "Terracota",
    hint: "warm earth · aconchegante",
    group: "quente",
    swatches: [
      "oklch(0.985 0.008 70)",
      "oklch(0.56 0.095 38)",
      "oklch(0.86 0.06 80)",
    ],
  },
  {
    id: "pessego",
    label: "Pêssego",
    hint: "peach fuzz · tendência",
    group: "quente",
    swatches: [
      "oklch(0.985 0.012 65)",
      "oklch(0.7 0.105 52)",
      "oklch(0.86 0.06 75)",
    ],
  },
  {
    id: "mel",
    label: "Mel + canela",
    hint: "dourado quente · acolhedor",
    group: "quente",
    swatches: [
      "oklch(0.985 0.014 75)",
      "oklch(0.55 0.105 60)",
      "oklch(0.85 0.075 75)",
    ],
  },
  {
    id: "coral",
    label: "Coral",
    hint: "rosa quente · alegre",
    group: "afetivo",
    swatches: [
      "oklch(0.985 0.01 40)",
      "oklch(0.64 0.135 28)",
      "oklch(0.86 0.07 50)",
    ],
  },
  {
    id: "salmao",
    label: "Salmão",
    hint: "rosa-laranja · vibrante",
    group: "afetivo",
    swatches: [
      "oklch(0.985 0.012 35)",
      "oklch(0.68 0.13 30)",
      "oklch(0.86 0.07 35)",
    ],
  },
  {
    id: "rosa",
    label: "Rosa-velho",
    hint: "afetivo · presente delicado",
    group: "afetivo",
    swatches: [
      "oklch(0.985 0.008 25)",
      "oklch(0.6 0.075 18)",
      "oklch(0.88 0.045 30)",
    ],
  },
  {
    id: "blush",
    label: "Blush",
    hint: "rosa-pó · super delicado",
    group: "afetivo",
    swatches: [
      "oklch(0.985 0.012 15)",
      "oklch(0.68 0.085 12)",
      "oklch(0.9 0.04 15)",
    ],
  },
  {
    id: "lavanda",
    label: "Lavanda + ouro",
    hint: "romântico · nostálgico",
    group: "afetivo",
    swatches: [
      "oklch(0.985 0.008 300)",
      "oklch(0.58 0.08 295)",
      "oklch(0.82 0.08 80)",
    ],
  },
  {
    id: "berinjela",
    label: "Berinjela + ouro",
    hint: "roxo profundo · noturno",
    group: "premium",
    swatches: [
      "oklch(0.985 0.008 320)",
      "oklch(0.42 0.095 325)",
      "oklch(0.82 0.075 80)",
    ],
  },
  {
    id: "bordo",
    label: "Bordô + ouro",
    hint: "ateliê premium · luxo",
    group: "premium",
    swatches: [
      "oklch(0.98 0.01 80)",
      "oklch(0.42 0.105 22)",
      "oklch(0.78 0.08 78)",
    ],
  },
];

const GROUP_ORDER: Group[] = ["verde", "quente", "afetivo", "premium"];

const GROUP_LABEL: Record<Group, string> = {
  verde: "verdes",
  quente: "quentes",
  afetivo: "afetivos",
  premium: "premium",
};

const STORAGE_KEY = "encantim:palette-preview";

function applyPalette(palette: Palette) {
  if (palette === "salvia") {
    document.documentElement.removeAttribute("data-palette");
  } else {
    document.documentElement.setAttribute("data-palette", palette);
  }
}

export function PaletteSwitcher() {
  const [active, setActive] = useState<Palette>("salvia");
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Palette | null;
    if (stored && PALETTE_IDS.includes(stored)) {
      setActive(stored);
      applyPalette(stored);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onPointerDown(e: PointerEvent) {
      if (!popoverRef.current) return;
      if (!window.matchMedia("(min-width: 1024px)").matches) return;
      if (!popoverRef.current.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  function select(palette: Palette) {
    setActive(palette);
    applyPalette(palette);
    window.localStorage.setItem(STORAGE_KEY, palette);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full border border-border/60 bg-card/95 px-3 py-2 text-xs font-medium text-foreground shadow-lg backdrop-blur transition hover:border-primary/40 lg:bottom-6"
        aria-label="abrir seletor de paleta"
      >
        <span className="flex overflow-hidden rounded-full border border-border/60">
          {PALETTES.find((p) => p.id === active)?.swatches.map((c, i) => (
            <span
              key={i}
              className="block h-4 w-2"
              style={{ background: c }}
            />
          ))}
        </span>
        paleta
      </button>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Preview de paleta"
        subtitle="Toque pra trocar — sua escolha fica salva"
      >
        <PaletteList active={active} onSelect={select} />
      </Sheet>

      {open ? (
        <div
          ref={popoverRef}
          className="fixed bottom-20 right-4 z-[70] hidden max-h-[80vh] w-72 flex-col rounded-2xl border border-border/60 bg-card/95 shadow-xl backdrop-blur lg:flex"
        >
          <div className="flex items-center justify-between border-b border-border/40 py-1 pl-3 pr-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              preview de paleta
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex size-9 items-center justify-center rounded-full text-base text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
              aria-label="fechar"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-col gap-2 overflow-y-auto p-2">
            <PaletteList active={active} onSelect={select} compact />
          </div>
        </div>
      ) : null}
    </>
  );
}

function PaletteList({
  active,
  onSelect,
  compact = false,
}: {
  active: Palette;
  onSelect: (p: Palette) => void;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex flex-col", compact ? "gap-2" : "gap-4")}>
      {GROUP_ORDER.map((group) => {
        const items = PALETTES.filter((p) => p.group === group);
        if (items.length === 0) return null;
        return (
          <div key={group} className="flex flex-col gap-1">
            <span
              className={cn(
                "font-semibold uppercase tracking-[0.24em] text-muted-foreground/70",
                compact ? "px-2 pt-1 text-[9px]" : "px-1 text-[10px]",
              )}
            >
              {GROUP_LABEL[group]}
            </span>
            {items.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelect(p.id)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border border-transparent text-left transition",
                  compact ? "px-2 py-2" : "px-2 py-2.5",
                  active === p.id
                    ? "border-primary/40 bg-primary/5"
                    : "hover:bg-muted/60",
                )}
              >
                <div className="flex shrink-0 overflow-hidden rounded-md border border-border/60">
                  {p.swatches.map((c, i) => (
                    <span
                      key={i}
                      className={cn(
                        "block",
                        compact ? "h-7 w-5" : "h-9 w-6",
                      )}
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <div className="flex flex-col leading-tight">
                  <span
                    className={cn(
                      "font-medium text-foreground",
                      compact ? "text-sm" : "text-base",
                    )}
                  >
                    {p.label}
                  </span>
                  <span
                    className={cn(
                      "text-muted-foreground",
                      compact ? "text-[11px]" : "text-xs",
                    )}
                  >
                    {p.hint}
                  </span>
                </div>
              </button>
            ))}
          </div>
        );
      })}
    </div>
  );
}
