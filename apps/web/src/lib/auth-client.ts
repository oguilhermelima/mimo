"use client";

import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import type { Auth } from "./auth";

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<Auth>(), adminClient()],
});

export const { signIn, signOut, signUp, useSession, getSession } = authClient;
