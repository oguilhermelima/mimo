import { eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";

import { db } from "./client";
import {
  Account,
  Bundle,
  BundleItem,
  BundleMedia,
  Coupon,
  PriceHistory,
  Product,
  ProductMedia,
  Stamp,
  User,
} from "./schema";

async function seedAdmin() {
  const email = process.env.INITIAL_ADMIN_EMAIL;
  const password = process.env.INITIAL_ADMIN_PASSWORD;
  if (!email || !password) {
    console.log(
      "seed: skipping admin (set INITIAL_ADMIN_EMAIL + INITIAL_ADMIN_PASSWORD to seed)",
    );
    return;
  }

  console.log(`seed: admin (${email})`);

  const existing = await db
    .select({ id: User.id })
    .from(User)
    .where(eq(User.email, email))
    .limit(1);

  if (existing[0]) {
    await db.delete(User).where(eq(User.id, existing[0].id));
  }

  const userId = crypto.randomUUID();
  const accountId = crypto.randomUUID();
  const hashed = await hashPassword(password);

  await db.insert(User).values({
    id: userId,
    name: "Admin",
    email,
    emailVerified: true,
    role: "admin",
  });

  await db.insert(Account).values({
    id: accountId,
    userId,
    accountId: userId,
    providerId: "credential",
    password: hashed,
  });
}

async function main() {
  console.log("seed: wiping");
  await db.delete(BundleItem);
  await db.delete(BundleMedia);
  await db.delete(Bundle);
  await db.delete(ProductMedia);
  await db.delete(PriceHistory);
  await db.delete(Coupon);
  await db.delete(Stamp);
  await db.delete(Product);

  await seedAdmin();

  console.log("seed: template shells");
  const [shellMedia] = await db
    .insert(Product)
    .values({
      type: "template_box",
      slug: "caixa-crua-media-mdf",
      title: "Caixa crua média (MDF)",
      description:
        "Caixa crua em MDF, formato médio — ideal para presentes médios com Bíblia, porta-joias ou kit de maquiagem.",
      priceCents: 3500,
      quantity: 25,
      lowStockThreshold: 5,
      color: "natural",
      widthMm: 240,
      heightMm: 180,
      depthMm: 75,
      tags: ["caixa-crua", "mdf", "media"],
      hidden: true,
    })
    .returning();

  const [shellAzul] = await db
    .insert(Product)
    .values({
      type: "template_box",
      slug: "caixa-crua-azul-clara",
      title: "Caixa crua azul clara",
      description:
        "Caixa revestida em tecido azul claro com cordão decorativo — aberta para receber as estampas e detalhes à mão.",
      priceCents: 4500,
      quantity: 15,
      lowStockThreshold: 4,
      color: "azul-claro",
      widthMm: 260,
      heightMm: 170,
      depthMm: 95,
      tags: ["caixa-crua", "azul"],
      hidden: true,
    })
    .returning();

  const [shellMini] = await db
    .insert(Product)
    .values({
      type: "template_box",
      slug: "caixa-crua-mini",
      title: "Caixa crua mini",
      description:
        "Caixa pequena para mimos delicados: pulseiras, colares, miniaturas.",
      priceCents: 2500,
      quantity: 30,
      lowStockThreshold: 6,
      color: "natural",
      widthMm: 120,
      heightMm: 100,
      depthMm: 60,
      tags: ["caixa-crua", "mini"],
      hidden: true,
    })
    .returning();

  if (!shellMedia || !shellAzul || !shellMini)
    throw new Error("seed: shell insert failed");

  console.log("seed: stamps");
  const [stampRosaFloral] = await db
    .insert(Stamp)
    .values({
      slug: "rosa-floral-vintage",
      name: "Rosa Floral Vintage",
      description: "Estampa floral em tons de rosa com laço cetim.",
      imageUrl: "/news/rosa-jardim-1.jpeg",
      priceCents: 1500,
      quantity: 20,
      lowStockThreshold: 4,
    })
    .returning();

  const [stampAzulProvence] = await db
    .insert(Stamp)
    .values({
      slug: "azul-provence",
      name: "Azul Provence",
      description: "Estampa floral azul inspirada em Provence, elegante.",
      imageUrl: "/news/azul-provence.jpeg",
      priceCents: 1700,
      quantity: 15,
      lowStockThreshold: 3,
    })
    .returning();

  const [stampBorboleta] = await db
    .insert(Stamp)
    .values({
      slug: "borboleta-flores",
      name: "Borboleta & Flores",
      description:
        "Estampa pastel com borboletas e flores delicadas, tom romântico.",
      imageUrl: "/news/borboleta-primavera.jpeg",
      priceCents: 1800,
      quantity: 12,
      lowStockThreshold: 3,
    })
    .returning();

  const [stampGaiola] = await db
    .insert(Stamp)
    .values({
      slug: "gaiola-vintage",
      name: "Gaiola Vintage",
      description:
        "Estampa com gaiola dourada e passarinho — charme clássico.",
      imageUrl: "/news/gaiola-dourada.jpeg",
      priceCents: 1600,
      quantity: 10,
      lowStockThreshold: 2,
    })
    .returning();

  const [stampJasmim] = await db
    .insert(Stamp)
    .values({
      slug: "jasmim-dourado",
      name: "Jasmim Dourado",
      description: "Flores de jasmim em fundo claro com laço verde-sálvia.",
      imageUrl: "/news/jasmim-2.jpeg",
      priceCents: 1700,
      quantity: 14,
      lowStockThreshold: 3,
    })
    .returning();

  const [stampPolka] = await db
    .insert(Stamp)
    .values({
      slug: "polka-delicada",
      name: "Polka Delicada",
      description: "Estampa de poá rosa claro com interior ilustrado.",
      imageUrl: "/news/polka-delicada.jpeg",
      priceCents: 1400,
      quantity: 12,
      lowStockThreshold: 3,
    })
    .returning();

  const [stampListras] = await db
    .insert(Stamp)
    .values({
      slug: "listras-romance",
      name: "Listras Romance",
      description: "Listras azuis claras com detalhe de rosa vintage.",
      imageUrl: "/news/listras-rosa.jpeg",
      priceCents: 1400,
      quantity: 10,
      lowStockThreshold: 2,
    })
    .returning();

  const [stampPadrinhos] = await db
    .insert(Stamp)
    .values({
      slug: "manual-padrinhos-azul",
      name: "Manual dos Padrinhos — Azul",
      description: "Estampa temática de casamento em tons de azul e flores.",
      imageUrl: "/news/padrinhos-3.jpeg",
      priceCents: 2200,
      quantity: 8,
      lowStockThreshold: 2,
    })
    .returning();

  const [stampMelodia] = await db
    .insert(Stamp)
    .values({
      slug: "melodia-partitura",
      name: "Melodia de Rosas",
      description:
        "Estampa com partitura musical e rosas em tons pastel — delicada.",
      imageUrl: "/news/melodia-rosas-1.jpeg",
      priceCents: 1600,
      quantity: 9,
      lowStockThreshold: 2,
    })
    .returning();

  if (
    !stampRosaFloral ||
    !stampAzulProvence ||
    !stampBorboleta ||
    !stampGaiola ||
    !stampJasmim ||
    !stampPolka ||
    !stampListras ||
    !stampPadrinhos ||
    !stampMelodia
  )
    throw new Error("seed: stamp insert failed");

  console.log("seed: content products");
  const [colarCoracao] = await db
    .insert(Product)
    .values({
      type: "jewelry",
      slug: "colar-coracao-delicado",
      title: "Colar coração delicado",
      description: "Colar em ouro folheado com pingente de coração e zircônia.",
      priceCents: 5500,
      quantity: 14,
      lowStockThreshold: 3,
      tags: ["colar", "jewelry"],
    })
    .returning();

  const [pulseiraVerde] = await db
    .insert(Product)
    .values({
      type: "jewelry",
      slug: "pulseira-coracao-verde",
      title: "Pulseira coração verde",
      description:
        "Pulseira fina folheada com pingente coração em zircônia verde.",
      priceCents: 4500,
      quantity: 12,
      lowStockThreshold: 3,
      tags: ["pulseira", "jewelry"],
    })
    .returning();

  const [pulseiraInfinito] = await db
    .insert(Product)
    .values({
      type: "jewelry",
      slug: "pulseira-infinito",
      title: "Pulseira infinito",
      description: "Pulseira fina com pingente infinito em aço cirúrgico.",
      priceCents: 3900,
      quantity: 16,
      lowStockThreshold: 3,
      tags: ["pulseira", "jewelry"],
    })
    .returning();

  const [kitPinceis] = await db
    .insert(Product)
    .values({
      type: "cosmetic",
      slug: "kit-pinceis-rose",
      title: "Kit de pincéis rosê",
      description:
        "Kit com 12 pincéis de maquiagem em rosê com espelho compacto.",
      priceCents: 3900,
      quantity: 18,
      lowStockThreshold: 4,
      tags: ["maquiagem", "pinceis"],
    })
    .returning();

  const [portaJoias] = await db
    .insert(Product)
    .values({
      type: "jewelry",
      slug: "porta-joias-rose",
      title: "Porta-joias rosê",
      description: "Porta-joias compacto em couro sintético rosê com zíper.",
      priceCents: 4500,
      quantity: 10,
      lowStockThreshold: 2,
      tags: ["joalheiro"],
    })
    .returning();

  const [potinhoCristal] = await db
    .insert(Product)
    .values({
      type: "jewelry",
      slug: "potinho-cristal",
      title: "Potinho decorativo de cristal",
      description:
        "Potinho em vidro cristal com tampa facetada — para pequenas joias.",
      priceCents: 2900,
      quantity: 15,
      lowStockThreshold: 3,
      tags: ["decorativo", "cristal"],
    })
    .returning();

  const [brigadeiros] = await db
    .insert(Product)
    .values({
      type: "cosmetic",
      slug: "brigadeiros-gourmet-6un",
      title: "Brigadeiros gourmet (6 un.)",
      description:
        "Trio de brigadeiros gourmet: chocolate, crocante e coco — 6 unidades.",
      priceCents: 3200,
      quantity: 20,
      lowStockThreshold: 5,
      tags: ["doces", "gourmet"],
    })
    .returning();

  const [ursinho] = await db
    .insert(Product)
    .values({
      type: "cosmetic",
      slug: "ursinho-pelucia",
      title: "Ursinho de pelúcia",
      description:
        "Ursinho de pelúcia macio com laço — escolha entre rosa ou azul.",
      priceCents: 5500,
      quantity: 22,
      lowStockThreshold: 4,
      tags: ["pelucia", "bebe"],
    })
    .returning();

  const [bibliaRosa] = await db
    .insert(Product)
    .values({
      type: "cosmetic",
      slug: "biblia-nva-capa-rosa",
      title: "Bíblia Sagrada NVA — capa rosa",
      description: "Bíblia Sagrada, tradução NVA, capa em guirlanda rosa.",
      priceCents: 8900,
      quantity: 10,
      lowStockThreshold: 2,
      tags: ["biblia", "nva"],
    })
    .returning();

  const [pulseiraJoiaAzul] = await db
    .insert(Product)
    .values({
      type: "jewelry",
      slug: "pulseira-joia-azul",
      title: "Pulseira joia azul",
      description: "Pulseira fina folheada com pingente coração azul cristal.",
      priceCents: 4200,
      quantity: 9,
      lowStockThreshold: 2,
      tags: ["pulseira", "jewelry"],
    })
    .returning();

  if (
    !colarCoracao ||
    !pulseiraVerde ||
    !pulseiraInfinito ||
    !kitPinceis ||
    !portaJoias ||
    !potinhoCristal ||
    !brigadeiros ||
    !ursinho ||
    !bibliaRosa ||
    !pulseiraJoiaAzul
  )
    throw new Error("seed: content insert failed");

  console.log("seed: catalog bundles");

  type BundleInput = {
    slug: string;
    title: string;
    description: string;
    templateBoxId: string;
    stampId: string | null;
    priceCents: number;
    quantity: number;
    lowStockThreshold: number;
    images: string[];
    items: { productId: string; quantity?: number }[];
  };

  const bundles: BundleInput[] = [
    {
      slug: "rosa-jardim",
      title: "Rosa Jardim",
      description:
        "Caixa floral em papel rosa com laço cetim verde-menta. Perfeita para um presente elegante e atemporal.",
      templateBoxId: shellMedia.id,
      stampId: stampRosaFloral.id,
      priceCents: 8900,
      quantity: 8,
      lowStockThreshold: 2,
      images: ["/news/rosa-jardim-1.jpeg", "/news/rosa-jardim-2.jpeg"],
      items: [],
    },
    {
      slug: "kit-beleza-rose",
      title: "Kit Beleza Rosé",
      description:
        "Caixa Rosa Floral com kit completo: pincéis rosê, porta-joias e potinho de cristal.",
      templateBoxId: shellMedia.id,
      stampId: stampRosaFloral.id,
      priceCents: 19900,
      quantity: 5,
      lowStockThreshold: 2,
      images: ["/news/kit-rose-1.jpeg", "/news/kit-rose-2.jpeg"],
      items: [
        { productId: kitPinceis.id },
        { productId: portaJoias.id },
        { productId: potinhoCristal.id },
      ],
    },
    {
      slug: "melodia-de-rosas",
      title: "Melodia de Rosas",
      description:
        "Caixa com estampa de partitura e rosas pastel + colar coração delicado.",
      templateBoxId: shellMedia.id,
      stampId: stampMelodia.id,
      priceCents: 15900,
      quantity: 6,
      lowStockThreshold: 2,
      images: [
        "/news/melodia-rosas-1.jpeg",
        "/news/melodia-rosas-2.jpeg",
      ],
      items: [{ productId: colarCoracao.id }],
    },
    {
      slug: "borboleta-primavera",
      title: "Borboleta Primavera",
      description:
        "Caixa vintage com borboletas e flores pastel + pulseira infinito.",
      templateBoxId: shellMedia.id,
      stampId: stampBorboleta.id,
      priceCents: 13900,
      quantity: 4,
      lowStockThreshold: 2,
      images: ["/news/borboleta-primavera.jpeg"],
      items: [{ productId: pulseiraInfinito.id }],
    },
    {
      slug: "gaiola-dourada",
      title: "Gaiola Dourada",
      description:
        "Caixa com estampa de gaiola vintage e laço bege + pulseira infinito.",
      templateBoxId: shellMedia.id,
      stampId: stampGaiola.id,
      priceCents: 12900,
      quantity: 4,
      lowStockThreshold: 2,
      images: ["/news/gaiola-dourada.jpeg"],
      items: [{ productId: pulseiraInfinito.id }],
    },
    {
      slug: "listras-romance",
      title: "Listras Romance",
      description:
        "Caixa listrada azul-rosa com rosa vintage na tampa e pulseira coração verde.",
      templateBoxId: shellMini.id,
      stampId: stampListras.id,
      priceCents: 11900,
      quantity: 5,
      lowStockThreshold: 2,
      images: ["/news/listras-rosa.jpeg"],
      items: [{ productId: pulseiraVerde.id }],
    },
    {
      slug: "polka-delicada",
      title: "Polka Delicada",
      description:
        "Caixa de poá rosa claro com interior ilustrado de passarinhos + pulseira.",
      templateBoxId: shellMini.id,
      stampId: stampPolka.id,
      priceCents: 10900,
      quantity: 6,
      lowStockThreshold: 2,
      images: ["/news/polka-delicada.jpeg"],
      items: [{ productId: pulseiraInfinito.id }],
    },
    {
      slug: "jasmim-dourado",
      title: "Jasmim Dourado",
      description:
        "Caixa com flores de jasmim e laço verde-sálvia + pulseira joia azul.",
      templateBoxId: shellMedia.id,
      stampId: stampJasmim.id,
      priceCents: 14900,
      quantity: 5,
      lowStockThreshold: 2,
      images: ["/news/jasmim-1.jpeg", "/news/jasmim-2.jpeg"],
      items: [{ productId: pulseiraJoiaAzul.id }],
    },
    {
      slug: "floral-nobre",
      title: "Floral Nobre",
      description:
        "Caixa maior em papel floral em relevo com detalhe em pérolas. Entregue vazia para o seu toque.",
      templateBoxId: shellMedia.id,
      stampId: null,
      priceCents: 16900,
      quantity: 3,
      lowStockThreshold: 1,
      images: ["/news/floral-nobre.jpeg"],
      items: [],
    },
    {
      slug: "rosa-classica-mini",
      title: "Rosa Clássica Mini",
      description:
        "Caixa pequena com laço rosa e rosa pintada à mão. Ideal para mimos sutis.",
      templateBoxId: shellMini.id,
      stampId: stampRosaFloral.id,
      priceCents: 9900,
      quantity: 7,
      lowStockThreshold: 2,
      images: ["/news/rosa-classica.jpeg"],
      items: [{ productId: pulseiraInfinito.id }],
    },
    {
      slug: "brigadeiros-gourmet",
      title: "Brigadeiros Gourmet",
      description:
        "Caixa azul clara com seis brigadeiros gourmet — chocolate, crocante e coco.",
      templateBoxId: shellAzul.id,
      stampId: stampAzulProvence.id,
      priceCents: 12900,
      quantity: 8,
      lowStockThreshold: 3,
      images: ["/news/brigadeiros.jpeg"],
      items: [{ productId: brigadeiros.id }],
    },
    {
      slug: "morana-giovinna",
      title: "Morana — Showcase",
      description:
        "Exemplo de caixa personalizada com bilhete em dourado e joia Morana. Sob encomenda com nome e mensagem à escolha.",
      templateBoxId: shellMini.id,
      stampId: null,
      priceCents: 18900,
      quantity: 3,
      lowStockThreshold: 1,
      images: ["/news/morana-giovinna.jpeg"],
      items: [{ productId: portaJoias.id }],
    },
    {
      slug: "romance-pink",
      title: "Romance Pink",
      description:
        "Caixa rosa pink com rosa delicada + pulseira coração verde brilhante.",
      templateBoxId: shellMini.id,
      stampId: stampRosaFloral.id,
      priceCents: 13900,
      quantity: 5,
      lowStockThreshold: 2,
      images: ["/news/romance-pink.jpeg"],
      items: [{ productId: pulseiraVerde.id }],
    },
    {
      slug: "mini-rosa",
      title: "Mini Rosa Delicada",
      description:
        "Caixinha com laço rosa e rosa pintada à mão. Mimo sutil pronto para presentear.",
      templateBoxId: shellMini.id,
      stampId: stampRosaFloral.id,
      priceCents: 7900,
      quantity: 10,
      lowStockThreshold: 3,
      images: ["/news/mini-rosa.jpeg"],
      items: [],
    },
    {
      slug: "azul-provence",
      title: "Azul Provence",
      description:
        "Caixa grande em papel azul floral com laço azul claro — elegante e espaçosa.",
      templateBoxId: shellAzul.id,
      stampId: stampAzulProvence.id,
      priceCents: 17900,
      quantity: 4,
      lowStockThreshold: 1,
      images: ["/news/azul-provence.jpeg"],
      items: [],
    },
    {
      slug: "padrinhos-azul-manual",
      title: "Padrinhos Azul — Manual",
      description:
        "Caixa de casamento com Manual dos Padrinhos e gravata azul. Inclui bilhete 'Para o grande dia!'.",
      templateBoxId: shellAzul.id,
      stampId: stampPadrinhos.id,
      priceCents: 29900,
      quantity: 3,
      lowStockThreshold: 1,
      images: [
        "/news/padrinhos-1.jpeg",
        "/news/padrinhos-2.jpeg",
        "/news/padrinhos-3.jpeg",
        "/news/padrinhos-4.jpeg",
      ],
      items: [],
    },
    {
      slug: "cha-de-bebe-duo",
      title: "Chá de Bebê Duo",
      description:
        "Par de caixas rosa e azul com ursinhos de pelúcia e ilustração infantil — para gêmeos ou família.",
      templateBoxId: shellMini.id,
      stampId: null,
      priceCents: 23900,
      quantity: 4,
      lowStockThreshold: 1,
      images: ["/news/cha-bebe.jpeg"],
      items: [{ productId: ursinho.id, quantity: 2 }],
    },
    {
      slug: "blackpink-lorena",
      title: "BlackPink — Showcase Personalizada",
      description:
        "Exemplo real de caixa personalizada para fã: caneca com nome + camiseta BlackPink + foto da banda aplicada.",
      templateBoxId: shellMini.id,
      stampId: null,
      priceCents: 21900,
      quantity: 2,
      lowStockThreshold: 1,
      images: ["/news/blackpink-lorena.jpeg"],
      items: [],
    },
    {
      slug: "cars-giovanna-15",
      title: "Cars Giovanna — 15 Anos",
      description:
        "Caixa temática Cars para festa de 15 anos — personalização total com nome, foto e idade.",
      templateBoxId: shellMini.id,
      stampId: null,
      priceCents: 24900,
      quantity: 2,
      lowStockThreshold: 1,
      images: ["/news/cars-giovanna.jpeg"],
      items: [],
    },
  ];

  for (const b of bundles) {
    const [row] = await db
      .insert(Bundle)
      .values({
        source: "catalog",
        slug: b.slug,
        title: b.title,
        description: b.description,
        templateBoxId: b.templateBoxId,
        stampId: b.stampId,
        priceCents: b.priceCents,
        quantity: b.quantity,
        lowStockThreshold: b.lowStockThreshold,
      })
      .returning();
    if (!row) throw new Error(`seed: bundle insert failed (${b.slug})`);

    if (b.items.length > 0) {
      await db.insert(BundleItem).values(
        b.items.map((it, i) => ({
          bundleId: row.id,
          productId: it.productId,
          quantity: it.quantity ?? 1,
          sortOrder: i,
        })),
      );
    }

    if (b.images.length > 0) {
      await db.insert(BundleMedia).values(
        b.images.map((url, i) => ({
          bundleId: row.id,
          kind: "image" as const,
          url,
          alt: `${b.title} — foto ${i + 1}`,
          sortOrder: i,
        })),
      );
    }
  }

  console.log("seed: product media");
  const unsplash = (id: string) =>
    `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;

  await db.insert(ProductMedia).values([
    {
      productId: shellAzul.id,
      kind: "image" as const,
      url: "/news/shell-azul-aberta.jpeg",
      alt: "Caixa crua azul clara — interior",
      sortOrder: 0,
    },
    {
      productId: colarCoracao.id,
      kind: "image" as const,
      url: unsplash("1639738491156-3bed044f1678"),
      alt: "Colar com pingente de coração",
      sortOrder: 0,
    },
    {
      productId: pulseiraVerde.id,
      kind: "image" as const,
      url: unsplash("1611591437281-460bfbe1220a"),
      alt: "Pulseira delicada",
      sortOrder: 0,
    },
    {
      productId: pulseiraInfinito.id,
      kind: "image" as const,
      url: unsplash("1619119069152-a2b331eb392a"),
      alt: "Pulseira infinito",
      sortOrder: 0,
    },
    {
      productId: pulseiraJoiaAzul.id,
      kind: "image" as const,
      url: unsplash("1721206624492-3d05631471ea"),
      alt: "Pulseira com pedra azul",
      sortOrder: 0,
    },
    {
      productId: kitPinceis.id,
      kind: "image" as const,
      url: unsplash("1684407616442-8d5a1b7c978e"),
      alt: "Kit de pincéis de maquiagem rosê",
      sortOrder: 0,
    },
    {
      productId: portaJoias.id,
      kind: "image" as const,
      url: unsplash("1680200256120-8ac04eb6f01d"),
      alt: "Porta-joias com colar",
      sortOrder: 0,
    },
    {
      productId: potinhoCristal.id,
      kind: "image" as const,
      url: unsplash("1526930135720-bb578fcf5752"),
      alt: "Potinho decorativo em cristal",
      sortOrder: 0,
    },
    {
      productId: brigadeiros.id,
      kind: "image" as const,
      url: unsplash("1599599810769-bcde5a160d32"),
      alt: "Brigadeiros gourmet",
      sortOrder: 0,
    },
    {
      productId: ursinho.id,
      kind: "image" as const,
      url: unsplash("1602734846297-9299fc2d4703"),
      alt: "Ursinho de pelúcia",
      sortOrder: 0,
    },
    {
      productId: bibliaRosa.id,
      kind: "image" as const,
      url: unsplash("1637962638303-02da705114c2"),
      alt: "Bíblia capa delicada",
      sortOrder: 0,
    },
  ]);

  console.log("seed: sample coupons");
  await db.insert(Coupon).values([
    {
      code: "MAE10",
      discountType: "percent",
      discountValue: 10,
      scope: "global",
      maxUses: 100,
      active: true,
    },
    {
      code: "PRIMEIRA20",
      discountType: "percent",
      discountValue: 20,
      scope: "global",
      maxUses: 50,
      active: true,
    },
    {
      code: "CASAMENTO50",
      discountType: "fixed",
      discountValue: 5000,
      scope: "global",
      maxUses: 20,
      active: true,
    },
  ]);

  console.log(
    `seed: done — ${bundles.length} bundles, 9 stamps, 13 products`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
