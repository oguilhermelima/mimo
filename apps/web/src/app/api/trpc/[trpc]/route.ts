import type { NextRequest } from "next/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter, createTRPCContext } from "@caixa/api";
import type { UserRole } from "@caixa/db/schema";

import { auth } from "~/lib/auth";

const handler = async (req: NextRequest) => {
  const session = await auth.api.getSession({ headers: req.headers });

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    router: appRouter,
    req,
    createContext: () =>
      createTRPCContext({
        headers: req.headers,
        session: session
          ? {
              session: {
                id: session.session.id,
                expiresAt: new Date(session.session.expiresAt),
              },
              user: {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                role: (session.user.role as UserRole | undefined) ?? "user",
                emailVerified: session.user.emailVerified,
              },
            }
          : null,
      }),
    onError({ error, path }) {
      console.error(`>>> tRPC Error on '${path}'`, error);
    },
  });
};

export { handler as GET, handler as POST };
