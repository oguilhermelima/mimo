import { CartView } from "~/components/cart-view";
import { LogoMonogram } from "~/components/logo";

export const metadata = { title: "carrinho" };

export default function CarrinhoPage() {
  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-6 py-12 md:px-10 md:py-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl text-primary md:text-5xl">
            Seu Carrinho
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Revise e finalize pelo WhatsApp
          </p>
        </div>
        <LogoMonogram className="hidden h-7 w-auto text-primary/60 md:block md:h-8" />
      </div>
      <CartView />
    </section>
  );
}
