import "server-only";

import { Resend } from "resend";

import { env } from "~/env";

let cached: Resend | null = null;

function client(): Resend {
  if (!cached) cached = new Resend(env.RESEND_API_KEY);
  return cached;
}

const baseStyles = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #fff5f7;
  padding: 32px 16px;
  color: #3d2030;
`;

const cardStyles = `
  max-width: 480px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 1px 2px rgba(190, 70, 100, 0.08);
`;

const buttonStyles = `
  display: inline-block;
  background: #c4477b;
  color: #ffffff;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 999px;
  font-weight: 500;
`;

function verificationEmailHtml(name: string, url: string): string {
  return `
<!doctype html>
<html lang="pt-BR">
  <body style="${baseStyles}">
    <div style="${cardStyles}">
      <h1 style="font-family: 'Cormorant Garamond', serif; color: #a8336a; font-size: 28px; margin: 0 0 16px;">
        ${env.NEXT_PUBLIC_STORE_NAME}
      </h1>
      <p style="font-size: 16px; line-height: 1.5;">Olá, ${name}!</p>
      <p style="font-size: 16px; line-height: 1.5;">
        Confirme seu email para ativar sua conta. O link é válido por 1 hora.
      </p>
      <p style="margin: 24px 0;">
        <a href="${url}" style="${buttonStyles}">Confirmar email</a>
      </p>
      <p style="font-size: 13px; color: #846270;">
        Se o botão não funcionar, copie e cole este link no navegador:<br />
        <a href="${url}" style="color: #c4477b; word-break: break-all;">${url}</a>
      </p>
    </div>
  </body>
</html>`.trim();
}

function changeEmailHtml(name: string, newEmail: string, url: string): string {
  return `
<!doctype html>
<html lang="pt-BR">
  <body style="${baseStyles}">
    <div style="${cardStyles}">
      <h1 style="font-family: 'Cormorant Garamond', serif; color: #a8336a; font-size: 28px; margin: 0 0 16px;">
        ${env.NEXT_PUBLIC_STORE_NAME}
      </h1>
      <p style="font-size: 16px; line-height: 1.5;">Olá, ${name}!</p>
      <p style="font-size: 16px; line-height: 1.5;">
        Recebemos um pedido para trocar o email da sua conta para
        <strong>${newEmail}</strong>. Confirme abaixo se foi você. O link expira em 1 hora.
      </p>
      <p style="margin: 24px 0;">
        <a href="${url}" style="${buttonStyles}">Confirmar troca de email</a>
      </p>
      <p style="font-size: 13px; color: #846270;">
        Se você não pediu, pode ignorar este email — sua conta segue com o email atual.
      </p>
    </div>
  </body>
</html>`.trim();
}

function resetPasswordHtml(name: string, url: string): string {
  return `
<!doctype html>
<html lang="pt-BR">
  <body style="${baseStyles}">
    <div style="${cardStyles}">
      <h1 style="font-family: 'Cormorant Garamond', serif; color: #a8336a; font-size: 28px; margin: 0 0 16px;">
        ${env.NEXT_PUBLIC_STORE_NAME}
      </h1>
      <p style="font-size: 16px; line-height: 1.5;">Olá, ${name}!</p>
      <p style="font-size: 16px; line-height: 1.5;">
        Recebemos um pedido pra redefinir sua senha. O link expira em 1 hora.
      </p>
      <p style="margin: 24px 0;">
        <a href="${url}" style="${buttonStyles}">Redefinir senha</a>
      </p>
      <p style="font-size: 13px; color: #846270;">
        Se você não pediu, pode ignorar este email.
      </p>
    </div>
  </body>
</html>`.trim();
}

export async function sendVerificationEmail(args: {
  to: string;
  name: string;
  url: string;
}): Promise<void> {
  await client().emails.send({
    from: env.RESEND_FROM,
    to: args.to,
    subject: `Confirme seu email — ${env.NEXT_PUBLIC_STORE_NAME}`,
    html: verificationEmailHtml(args.name, args.url),
  });
}

export async function sendResetPasswordEmail(args: {
  to: string;
  name: string;
  url: string;
}): Promise<void> {
  await client().emails.send({
    from: env.RESEND_FROM,
    to: args.to,
    subject: `Redefinir senha — ${env.NEXT_PUBLIC_STORE_NAME}`,
    html: resetPasswordHtml(args.name, args.url),
  });
}

export async function sendChangeEmailVerification(args: {
  to: string;
  name: string;
  newEmail: string;
  url: string;
}): Promise<void> {
  await client().emails.send({
    from: env.RESEND_FROM,
    to: args.to,
    subject: `Confirme a troca de email — ${env.NEXT_PUBLIC_STORE_NAME}`,
    html: changeEmailHtml(args.name, args.newEmail, args.url),
  });
}
