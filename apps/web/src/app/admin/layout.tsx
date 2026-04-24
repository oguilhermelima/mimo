import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "~/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/entrar?from=/admin");
  }
  if (session.user.role !== "admin") {
    redirect("/");
  }

  return <>{children}</>;
}
