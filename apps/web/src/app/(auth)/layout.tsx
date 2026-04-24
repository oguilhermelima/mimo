import Link from "next/link";

import { Logo } from "~/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-svh bg-gradient-to-b from-background via-rose-50/40 to-background py-12">
      <div className="mx-auto w-full max-w-md px-4">
        <Link href="/" className="mb-6 flex justify-center">
          <Logo variant="stacked" withTagline markClassName="size-12" />
        </Link>
        <div className="rounded-2xl bg-card p-8 ring-1 ring-border/40 shadow-sm">
          {children}
        </div>
      </div>
    </main>
  );
}
