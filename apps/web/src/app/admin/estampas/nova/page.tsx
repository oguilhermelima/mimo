import { AdminNav } from "~/components/admin/admin-nav";
import { StampForm } from "~/components/admin/stamp-form";

export default function NewStampPage() {
  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-6 py-12 md:px-10 md:py-16">
      <header className="space-y-4">
        <h1 className="font-serif text-3xl text-primary">Nova estampa</h1>
        <AdminNav />
      </header>
      <StampForm />
    </section>
  );
}
