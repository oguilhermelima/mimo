"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, ShoppingBag, User } from "lucide-react";

import { cn } from "@caixa/ui";

import { useCart } from "~/lib/cart-store";
import { Logo } from "./logo";

const NAV_LINKS = [
  { href: "/produtos", label: "Presentes" },
  { href: "/encomenda", label: "Encomenda" },
  { href: "/sobre", label: "Sobre" },
];

export function SiteHeader() {
  const count = useCart((s) => s.entries.reduce((n, e) => n + e.quantity, 0));
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 24;
      setScrolled((prev) => (prev === next ? prev : next));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b bg-background transition-[border-color,box-shadow] duration-300",
        scrolled
          ? "border-border/30 shadow-sm shadow-background/10"
          : "border-transparent",
      )}
    >
      <div
        className={cn(
          "mx-auto grid w-full max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-6 transition-[padding] duration-300 md:px-10 lg:grid-cols-[1fr_auto_1fr] lg:gap-6",
          scrolled ? "py-3 lg:py-4" : "py-5 lg:py-7",
        )}
      >
        <nav className="hidden items-center gap-1 text-sm lg:-ml-3 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-foreground/80 transition hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          aria-label="Encantim"
          className="group flex items-center justify-center gap-2.5"
        >
          <Logo
            variant="full"
            markClassName={cn(
              "transition-all duration-300",
              scrolled ? "size-8 md:size-9" : "size-10 md:size-12",
            )}
            wordmarkClassName={cn(
              "transition-all duration-300",
              scrolled
                ? "[&_span]:text-2xl md:[&_span]:text-[1.75rem]"
                : "[&_span]:text-3xl md:[&_span]:text-[2.25rem]",
            )}
          />
        </Link>

        <div className="flex items-center justify-end gap-1 lg:-mr-2 lg:gap-3">
          <div className="hidden items-center gap-2 rounded-full bg-foreground/5 px-3 py-2 text-sm text-foreground/60 ring-1 ring-border/50 transition focus-within:ring-primary/50 lg:flex lg:w-56">
            <Search className="size-4 shrink-0" />
            <input
              type="search"
              placeholder="Buscar"
              className="w-full bg-transparent placeholder:text-foreground/50 focus:outline-none"
              aria-label="Buscar"
            />
          </div>
          <Link
            href="/conta"
            aria-label="Minha conta"
            className="flex size-9 items-center justify-center rounded-full text-foreground/80 transition hover:bg-foreground/5 hover:text-primary lg:size-10"
          >
            <User className="size-5" />
          </Link>
          <Link
            href="/carrinho"
            aria-label="Carrinho"
            className="relative flex size-9 items-center justify-center rounded-full text-foreground/80 transition hover:bg-foreground/5 hover:text-primary lg:size-10"
          >
            <ShoppingBag className="size-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
