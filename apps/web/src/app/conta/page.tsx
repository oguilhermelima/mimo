import { User } from "lucide-react";

export const metadata = { title: "conta" };

export default function ContaPage() {
  return (
    <section className="mx-auto w-full max-w-xl px-6 py-16 text-center md:px-10 md:py-24">
      <div className="mx-auto mb-6 inline-flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <User className="size-8" />
      </div>
      <h1 className="font-serif text-4xl text-primary">Sua conta</h1>
      <p className="mt-3 text-muted-foreground">
        em breve você poderá acompanhar suas encomendas e guardar endereços por
        aqui.
      </p>
    </section>
  );
}
