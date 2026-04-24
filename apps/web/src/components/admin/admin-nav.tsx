"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Produtos", match: ["/admin", "/admin/produtos"] },
  { href: "/admin/caixas", label: "Caixas", match: ["/admin/caixas"] },
  { href: "/admin/estampas", label: "Estampas", match: ["/admin/estampas"] },
  { href: "/admin/cupons", label: "Cupons", match: ["/admin/cupons"] },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap gap-2">
      {LINKS.map((l) => {
        const active = l.match.some((p) =>
          p === "/admin" ? pathname === p : pathname.startsWith(p),
        );
        return (
          <Link
            key={l.href}
            href={l.href}
            className={
              active
                ? "rounded-full bg-primary px-4 py-1.5 text-sm text-primary-foreground"
                : "rounded-full bg-muted/60 px-4 py-1.5 text-sm text-muted-foreground ring-1 ring-border/60 transition hover:bg-primary/10 hover:text-primary"
            }
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
