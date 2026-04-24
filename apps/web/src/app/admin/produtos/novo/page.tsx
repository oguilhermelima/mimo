import { ProductForm } from "~/components/admin/product-form";

export const metadata = { title: "novo produto" };

export default function NewProductPage() {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 px-6 py-12 md:px-10 md:py-16">
      <h1 className="font-serif text-3xl text-primary md:text-4xl">
        novo produto
      </h1>
      <ProductForm />
    </section>
  );
}
