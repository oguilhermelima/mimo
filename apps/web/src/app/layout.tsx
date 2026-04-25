import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";

import { cn } from "@caixa/ui";
import { ThemeProvider } from "@caixa/ui/theme";
import { Toaster } from "@caixa/ui/toast";

import { env } from "~/env";
import { Logo } from "~/components/logo";
import { MobileNav } from "~/components/mobile-nav";
import { OrnamentalDivider } from "~/components/ornaments";
import { PaletteSwitcher } from "~/components/palette-switcher";
import { ScrollRestore } from "~/components/scroll-restore";
import { SiteHeader } from "~/components/site-header";
import { TRPCReactProvider } from "~/trpc/react";

import "~/app/styles.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const serif = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: {
    default: `${env.NEXT_PUBLIC_STORE_NAME} — caixinhas artesanais`,
    template: `%s · ${env.NEXT_PUBLIC_STORE_NAME}`,
  },
  description:
    "Encantim — caixinhas artesanais feitas à mão para presentes delicados. Dia das mães, aniversários, momentos especiais.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdf6f4" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1217" },
  ],
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="light" suppressHydrationWarning>
      <body
        className={cn(
          "flex min-h-screen flex-col overflow-x-clip bg-background font-sans text-foreground antialiased",
          inter.variable,
          serif.variable,
        )}
      >
        <ThemeProvider>
          <TRPCReactProvider>
            <ScrollRestore />
            <SiteHeader />
            <main className="flex-1 overflow-x-clip pb-20 pt-[64px] lg:pb-0 lg:pt-[88px]">
              {props.children}
            </main>
            <MobileNav />

            <footer className="relative mt-20 overflow-hidden border-t border-border/40 bg-gradient-to-br from-primary/5 via-muted/30 to-accent/30">
              <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-7 px-6 pb-28 pt-16 text-center md:px-10 md:py-20">
                <Logo
                  variant="full"
                  withTagline
                  markClassName="size-14 md:size-16"
                  wordmarkClassName="text-2xl md:text-3xl"
                />
                <OrnamentalDivider className="h-4 w-40 text-primary/50" />
                <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                  Caixas artesanais em edição limitada, feitas com carinho
                  peça por peça. Encomende pelo WhatsApp.
                </p>
                <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground/80">
                  © {new Date().getFullYear()} {env.NEXT_PUBLIC_STORE_NAME} ·
                  todos os direitos reservados
                </p>
              </div>
            </footer>
            <Toaster />
            <PaletteSwitcher />
          </TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
