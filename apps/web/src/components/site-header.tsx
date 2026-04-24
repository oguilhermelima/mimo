"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { useCart } from "~/lib/cart-store";
import { Logo } from "./logo";

export function SiteHeader() {
  const count = useCart((s) => s.entries.reduce((n, e) => n + e.quantity, 0));

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/30 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-3 md:px-10 md:py-3.5">
        <Link href="/" className="group inline-flex items-center">
          <Logo
            markClassName="size-9 transition-transform group-hover:-rotate-6 md:size-10"
            wordmarkClassName="hidden text-base sm:inline-flex md:text-lg"
          />
        </Link>
        <nav className="flex items-center gap-2 text-sm md:gap-4">
          <Link
            href="/#catalogo"
            className="hidden rounded-full px-3 py-2 text-muted-foreground transition hover:text-primary md:inline-flex"
          >
            Catálogo
          </Link>
          <Link
            href="/carrinho"
            className="relative flex items-center gap-2 rounded-full bg-primary/10 px-3 py-2 text-primary transition hover:bg-primary/20 md:px-4"
          >
            <ShoppingBag className="size-4" />
            <span className="hidden sm:inline">Carrinho</span>
            {count > 0 && (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-xs font-semibold leading-none text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
