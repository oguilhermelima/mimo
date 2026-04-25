import { CartView } from "~/components/cart-view";

export const metadata = { title: "carrinho" };

export default function CarrinhoPage() {
  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-6 py-12 md:px-10 md:py-16">
      <div>
        <h1 className="font-serif text-4xl text-primary md:text-5xl">
          Seu Carrinho
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Revise e finalize pelo WhatsApp
        </p>
      </div>
      <CartView />
    </section>
  );
}
