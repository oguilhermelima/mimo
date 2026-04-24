const encoder = new TextEncoder();

async function hmacHex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function signSession(secret: string, payload = "admin"): Promise<string> {
  return `${payload}.${await hmacHex(secret, payload)}`;
}

export async function verifySession(
  secret: string,
  token: string | undefined | null,
): Promise<boolean> {
  if (!token) return false;
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return false;
  const expected = await hmacHex(secret, payload);
  if (mac.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < mac.length; i++) {
    diff |= mac.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export const SESSION_COOKIE_NAME = "admin-session";
