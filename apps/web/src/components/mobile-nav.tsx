"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  ShoppingBag,
  Sparkles,
  User,
  type LucideIcon,
} from "lucide-react";

import { useCart } from "~/lib/cart-store";

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  match?: (pathname: string) => boolean;
}

const ITEMS: NavItem[] = [
  {
    href: "/",
    icon: Home,
    label: "Início",
    match: (p) => p === "/",
  },
  {
    href: "/produtos",
    icon: Package,
    label: "Produtos",
    match: (p) => p.startsWith("/produtos") || p.startsWith("/produto") || p.startsWith("/caixa"),
  },
  {
    href: "/encomenda",
    icon: Sparkles,
    label: "Montar",
    match: (p) => p.startsWith("/encomenda"),
  },
  {
    href: "/carrinho",
    icon: ShoppingBag,
    label: "Carrinho",
    match: (p) => p.startsWith("/carrinho"),
  },
  {
    href: "/conta",
    icon: User,
    label: "Conta",
    match: (p) => p.startsWith("/conta"),
  },
];

export function MobileNav() {
  const pathname = usePathname() ?? "/";
  const count = useCart((s) => s.entries.reduce((n, e) => n + e.quantity, 0));

  return (
    <nav
      aria-label="navegação principal"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/30 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5 items-stretch px-1 py-1.5">
        {ITEMS.map((it) => {
          const active = it.match ? it.match(pathname) : pathname === it.href;
          const Icon = it.icon;
          const showBadge = it.href === "/carrinho" && count > 0;
          return (
            <li key={it.href} className="flex">
              <Link
                href={it.href}
                className={`group relative flex min-h-12 w-full flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] transition ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="relative flex items-center justify-center">
                  <Icon
                    className={`size-5 transition ${active ? "scale-110" : ""}`}
                  />
                  {showBadge && (
                    <span className="absolute -right-2 -top-1.5 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 py-0.5 text-[9px] font-semibold leading-none text-primary-foreground">
                      {count}
                    </span>
                  )}
                </span>
                <span className="font-medium tracking-wide">{it.label}</span>
                {active && (
                  <span
                    aria-hidden
                    className="absolute bottom-0.5 h-0.5 w-6 rounded-full bg-primary"
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
