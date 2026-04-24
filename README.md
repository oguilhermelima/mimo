# Encantim

Loja de caixinhas artesanais personalizadas. Monorepo T3 Turbo (pnpm + turbo + Next 16 + tRPC v11 + Drizzle + Postgres).

## Stack

- **Web**: Next.js 16, React 19, Tailwind v4, shadcn/ui (via `@caixa/ui`)
- **API**: tRPC v11 (em `packages/api`), consumida pelo web via `@trpc/tanstack-react-query`
- **DB**: Postgres + Drizzle ORM (em `packages/db`), `postgres-js` driver
- **Carrinho**: zustand persistido em localStorage
- **Checkout**: WhatsApp (link `wa.me` com texto pré-montado — sem gateway de pagamento)
- **Admin**: senha única + cookie HMAC (placeholder — migrar para better-auth depois)

## Estrutura

```
apps/
└── web/                # Next.js app (storefront + admin)
packages/
├── api/                # tRPC routers
├── db/                 # schema Drizzle + client
├── ui/                 # componentes shadcn compartilhados
└── validators/         # schemas Zod compartilhados
tooling/
├── eslint/ prettier/ tailwind/ typescript/
```

## Modelo

**Produto polimórfico** (tabela única `product`):

- `parentId` aponta para outro produto → permite compor ("sabonete" filho de "caixa das mães")
- `priceCents` opcional (itens só expositivos ou compostos podem não ter preço individual)
- `hidden` esconde do catálogo público
- `paymentMethods` array: `pix`, `credito`, `debito`, `ted`
- Dimensões em mm: `widthMm`, `heightMm`, `depthMm`
- Mídia em tabela separada (`product_media`, suporta imagem e vídeo)

## Rodando localmente

```bash
pnpm install
cp .env.example .env            # preencha DATABASE_URL + ADMIN_PASSWORD
pnpm db:push                    # aplica schema
pnpm db:seed                    # popula com demo
pnpm dev:web                    # http://localhost:3000
```

Admin: `http://localhost:3000/admin` → login com `ADMIN_PASSWORD`.

## Fluxo de compra

1. Usuário navega pelo catálogo (`/`)
2. Entra no produto (`/produto/<slug>`), monta a caixinha selecionando filhos
3. Adiciona ao carrinho, ajusta quantidade, escolhe forma de pagamento
4. Botão "encomendar no WhatsApp" abre `wa.me` com a mensagem pronta

Não processamos pagamento na interface — tudo fecha no WhatsApp.

## Deploy

Stack de produção: **Vercel** (Next.js + API routes) + **Neon** (Postgres gerenciado).

### 1. Postgres no Neon

1. Criar projeto em [neon.tech](https://neon.tech) (Free tier serve).
2. Copiar a connection string (use a **pooled**).
3. Localmente, colar em `.env` como `DATABASE_URL` e rodar:
   ```bash
   pnpm db:push       # cria schema no Neon
   pnpm db:seed       # opcional: popula demo
   ```

### 2. Vercel

```bash
vercel login                    # login interativo (abre browser)
cd apps/web
vercel link                     # linka o projeto; aceita "apps/web" como Root Directory
```

Env vars (CLI ou pelo dashboard → Settings → Environment Variables):

| Nome | Descrição |
|------|-----------|
| `DATABASE_URL` | connection string do Neon (pooled) |
| `ADMIN_PASSWORD` | senha do `/admin` (mínimo 6 chars) |
| `ADMIN_SESSION_SECRET` | secret pra HMAC do cookie admin (mínimo 16 chars) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | DDI+DDD+número, só dígitos (ex: `5511999999999`) |
| `NEXT_PUBLIC_STORE_NAME` | opcional, default `Encantim` |

Gerar `ADMIN_SESSION_SECRET`:
```bash
openssl rand -hex 32
```

Adicionar via CLI:
```bash
vercel env add DATABASE_URL production
vercel env add ADMIN_PASSWORD production
vercel env add ADMIN_SESSION_SECRET production
vercel env add NEXT_PUBLIC_WHATSAPP_NUMBER production
# repetir com "preview" e "development" se quiser ambientes separados
```

Deploy:
```bash
vercel --prod
```

Vercel auto-detecta Next.js + Turborepo. Se precisar customizar build, ver `apps/web/vercel.json`.
