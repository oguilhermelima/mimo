"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { cn } from "@caixa/ui";

import { useCart } from "~/lib/cart-store";
import { Logo } from "./logo";

export function SiteHeader() {
  const count = useCart((s) => s.entries.reduce((n, e) => n + e.quantity, 0));
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl transition-[background,border-color,box-shadow] duration-300",
        scrolled
          ? "border-border/30 bg-background/75 shadow-sm shadow-background/10 supports-[backdrop-filter]:bg-background/55"
          : "border-transparent bg-background/40 supports-[backdrop-filter]:bg-background/25",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 transition-[padding] duration-300 lg:px-10",
          scrolled ? "py-1 lg:py-2" : "py-2.5 lg:py-4",
        )}
      >
        <Link href="/" className="group inline-flex items-center">
          <Logo
            markClassName={cn(
              "text-foreground transition-all duration-300 group-hover:-rotate-6",
              scrolled ? "size-6 lg:size-9" : "size-9 lg:size-12",
            )}
            wordmarkClassName={cn(
              "inline-flex text-foreground transition-all duration-300",
              scrolled ? "text-sm lg:text-lg" : "text-lg lg:text-2xl",
            )}
          />
        </Link>
        <nav className="hidden items-center gap-4 text-sm lg:flex">
          <Link
            href="/produtos"
            className="rounded-full px-3 py-2 text-muted-foreground transition hover:text-primary"
          >
            Produtos
          </Link>
          <Link
            href="/encomenda"
            className="rounded-full px-3 py-2 text-muted-foreground transition hover:text-primary"
          >
            Montar
          </Link>
          <Link
            href="/sobre"
            className="rounded-full px-3 py-2 text-muted-foreground transition hover:text-primary"
          >
            Sobre
          </Link>
          <Link
            href="/carrinho"
            className="relative flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-primary transition hover:bg-primary/20"
          >
            <ShoppingBag className="size-4" />
            <span>Carrinho</span>
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
