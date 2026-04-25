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

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;

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

  console.log("seed: child products (conteúdos)");

  const [bibliaRosa] = await db
    .insert(Product)
    .values({
      type: "cosmetic",
      slug: "biblia-sagrada-nva-capa-rosa",
      title: "Bíblia Sagrada NVA — Capa Rosa Guirlanda",
      description:
        "Bíblia Sagrada, tradução Nova Versão Almeida (NVA), capa em guirlanda rosa floral pela Sociedade Bíblica.",
      priceCents: 8900,
      quantity: 12,
      lowStockThreshold: 3,
      widthMm: 145,
      heightMm: 210,
      depthMm: 28,
      tags: ["biblia", "nva"],
    })
    .returning();

  const [portaJoias] = await db
    .insert(Product)
    .values({
      type: "jewelry",
      slug: "porta-joias-rose",
      title: "Porta-joias rosê com zíper",
      description:
        "Porta-joias compacto em couro sintético rosê com zíper duplo e divisórias internas para anéis, brincos e correntes.",
      priceCents: 4500,
      quantity: 14,
      lowStockThreshold: 3,
      widthMm: 110,
      heightMm: 110,
      depthMm: 55,
      tags: ["joalheiro", "rose"],
    })
    .returning();

  const [kitPinceis] = await db
    .insert(Product)
    .values({
      type: "cosmetic",
      slug: "kit-pinceis-rose-com-espelho",
      title: "Kit de pincéis rosê com espelho",
      description:
        "Kit com 12 pincéis profissionais de maquiagem em rosê, com estojo retrátil e espelho compacto.",
      priceCents: 3900,
      quantity: 18,
      lowStockThreshold: 4,
      widthMm: 130,
      heightMm: 95,
      depthMm: 35,
      tags: ["maquiagem", "pinceis", "rose"],
    })
    .returning();

  const [potinhoCristal] = await db
    .insert(Product)
    .values({
      type: "jewelry",
      slug: "potinho-cristal-facetado",
      title: "Potinho de cristal facetado",
      description:
        "Potinho decorativo em vidro cristal com tampa facetada — ideal para anéis, brincos ou pequenas joias.",
      priceCents: 2900,
      quantity: 15,
      lowStockThreshold: 3,
      widthMm: 80,
      heightMm: 100,
      depthMm: 80,
      tags: ["decorativo", "cristal"],
    })
    .returning();

  const [colarCoracao] = await db
    .insert(Product)
    .values({
      type: "jewelry",
      slug: "colar-coracao-zirconia",
      title: "Colar coração delicado com zircônia",
      description:
        "Colar fino em ouro folheado com pingente de coração cravejado em zircônia branca.",
      priceCents: 5500,
      quantity: 14,
      lowStockThreshold: 3,
      widthMm: 8,
      heightMm: 10,
      depthMm: 3,
      tags: ["colar", "coracao", "jewelry"],
    })
    .returning();

  const [pulseiraVerde] = await db
    .insert(Product)
    .values({
      type: "jewelry",
      slug: "pulseira-coracao-esmeralda",
      title: "Pulseira coração verde-esmeralda",
      description:
        "Pulseira fina em corrente veneziana folheada a ouro com pingente coração em zircônia verde-esmeralda.",
      priceCents: 4500,
      quantity: 12,
      lowStockThreshold: 3,
      widthMm: 8,
      heightMm: 8,
      depthMm: 3,
      tags: ["pulseira", "coracao", "jewelry"],
    })
    .returning();

  const [manualPadrinhos] = await db
    .insert(Product)
    .values({
      type: "cosmetic",
      slug: "manual-padrinhos-livreto",
      title: "Manual dos Padrinhos (livreto)",
      description:
        "Livreto ilustrado em capa floral com rosas azuis e brancas — guia ritual para padrinhos e madrinhas.",
      priceCents: 4900,
      quantity: 8,
      lowStockThreshold: 2,
      widthMm: 150,
      heightMm: 150,
      depthMm: 8,
      tags: ["padrinhos", "casamento", "convite"],
    })
    .returning();

  const [gravataAzul] = await db
    .insert(Product)
    .values({
      type: "cosmetic",
      slug: "gravata-cetim-azul-claro",
      title: "Gravata cetim azul claro",
      description:
        "Gravata clássica em cetim azul claro com etiqueta \"Para o grande dia!\" — acompanha caixa de padrinhos.",
      priceCents: 6900,
      quantity: 6,
      lowStockThreshold: 2,
      widthMm: 80,
      heightMm: 1450,
      depthMm: 5,
      tags: ["gravata", "cetim", "padrinhos"],
    })
    .returning();

  const [almofadinhaAlianca] = await db
    .insert(Product)
    .values({
      type: "jewelry",
      slug: "almofadinha-alianca-azul-cristal",
      title: "Almofadinha aliança com pingente azul-cristal",
      description:
        "Almofadinha branca em cetim com aliança fina cravejada por pingente coração em cristal azul.",
      priceCents: 7900,
      quantity: 5,
      lowStockThreshold: 2,
      widthMm: 90,
      heightMm: 90,
      depthMm: 30,
      tags: ["alianca", "casamento", "padrinhos"],
    })
    .returning();

  if (
    !bibliaRosa ||
    !portaJoias ||
    !kitPinceis ||
    !potinhoCristal ||
    !colarCoracao ||
    !pulseiraVerde ||
    !manualPadrinhos ||
    !gravataAzul ||
    !almofadinhaAlianca
  )
    throw new Error("seed: child product insert failed");

  console.log("seed: child product media");
  await db.insert(ProductMedia).values([
    {
      productId: bibliaRosa.id,
      kind: "image" as const,
      url: unsplash("1637962638303-02da705114c2"),
      alt: "Bíblia capa rosa floral",
      sortOrder: 0,
    },
    {
      productId: portaJoias.id,
      kind: "image" as const,
      url: unsplash("1680200256120-8ac04eb6f01d"),
      alt: "Porta-joias rosê",
      sortOrder: 0,
    },
    {
      productId: kitPinceis.id,
      kind: "image" as const,
      url: unsplash("1513122991877-4a5678e6d72f"),
      alt: "Pincéis de maquiagem com acabamento dourado",
      sortOrder: 0,
    },
    {
      productId: potinhoCristal.id,
      kind: "image" as const,
      url: unsplash("1526930135720-bb578fcf5752"),
      alt: "Potinho de cristal facetado",
      sortOrder: 0,
    },
    {
      productId: colarCoracao.id,
      kind: "image" as const,
      url: unsplash("1639738491156-3bed044f1678"),
      alt: "Colar coração delicado",
      sortOrder: 0,
    },
    {
      productId: pulseiraVerde.id,
      kind: "image" as const,
      url: unsplash("1611591437281-460bfbe1220a"),
      alt: "Pulseira delicada com pingente coração",
      sortOrder: 0,
    },
    {
      productId: manualPadrinhos.id,
      kind: "image" as const,
      url: unsplash("1632610992723-82d7c212f6d7"),
      alt: "Convite/manual de casamento",
      sortOrder: 0,
    },
    {
      productId: gravataAzul.id,
      kind: "image" as const,
      url: unsplash("1717730798581-0061672774e9"),
      alt: "Terno azul com gravata",
      sortOrder: 0,
    },
    {
      productId: almofadinhaAlianca.id,
      kind: "image" as const,
      url: unsplash("1627293509201-cd0c780043e6"),
      alt: "Alianças sobre tecido branco",
      sortOrder: 0,
    },
  ]);

  console.log("seed: template boxes (shells dos bundles — hidden)");

  type ShellInput = {
    slug: string;
    title: string;
    description: string;
    priceCents: number;
    quantity: number;
    widthMm: number;
    heightMm: number;
    depthMm: number;
    color: string;
    coverUrl: string;
    tags: string[];
  };

  const shells: ShellInput[] = [
    {
      slug: "shell-sabedoria",
      title: "Caixa Sabedoria",
      description:
        "Caixa retangular grande em papel de poá rosa e azul claro com aplique de madeira escrito \"Sabedoria\" e detalhe de cartão postal vintage.",
      priceCents: 8900,
      quantity: 4,
      widthMm: 280,
      heightMm: 210,
      depthMm: 65,
      color: "rosa-azul",
      coverUrl: "/catalogo/sabedoria-0.jpeg",
      tags: ["caixa", "vintage", "sabedoria"],
    },
    {
      slug: "shell-azul-perolas",
      title: "Caixa Azul Pérolas",
      description:
        "Caixa retangular grande em papel floral azul-petróleo com pérolas brancas aplicadas e fita cetim azul.",
      priceCents: 9900,
      quantity: 5,
      widthMm: 280,
      heightMm: 210,
      depthMm: 60,
      color: "azul",
      coverUrl: "/catalogo/azul-perolas-0.jpeg",
      tags: ["caixa", "perolas", "azul"],
    },
    {
      slug: "shell-rosa-jardim",
      title: "Caixa Rosa Jardim",
      description:
        "Caixa quadrada média em papel floral com rosas e botões em tons quentes, lacinho cetim rosa.",
      priceCents: 6900,
      quantity: 6,
      widthMm: 220,
      heightMm: 220,
      depthMm: 100,
      color: "rosa",
      coverUrl: "/catalogo/rosa-jardim-0.jpeg",
      tags: ["caixa", "rosa", "floral"],
    },
    {
      slug: "shell-melodia-rosas",
      title: "Caixa Melodia de Rosas",
      description:
        "Caixa quadrada média em papel com partitura musical e rosas grandes em tons coral, fita cetim verde-menta.",
      priceCents: 6500,
      quantity: 5,
      widthMm: 200,
      heightMm: 200,
      depthMm: 80,
      color: "coral-verde",
      coverUrl: "/catalogo/melodia-rosas-0.jpeg",
      tags: ["caixa", "musica", "rosas"],
    },
    {
      slug: "shell-borboletas-salvia",
      title: "Caixa Borboletas Sálvia",
      description:
        "Caixa retangular média em verde-sálvia com borboletas e flores pastel, fecho dourado e lacinho verde-menta.",
      priceCents: 7900,
      quantity: 3,
      widthMm: 250,
      heightMm: 170,
      depthMm: 95,
      color: "verde-salvia",
      coverUrl: "/catalogo/borboletas-salvia-0.jpeg",
      tags: ["caixa", "borboletas", "salvia"],
    },
    {
      slug: "shell-gaiola-dourada",
      title: "Caixa Gaiola Dourada",
      description:
        "Caixa retangular pequena em papel azul claro com ilustração de gaiola dourada e passarinho vintage, fechada por fita e fecho dourados.",
      priceCents: 5900,
      quantity: 4,
      widthMm: 200,
      heightMm: 140,
      depthMm: 85,
      color: "azul-claro",
      coverUrl: "/catalogo/gaiola-dourada-0.jpeg",
      tags: ["caixa", "gaiola", "vintage"],
    },
    {
      slug: "shell-listras-vintage",
      title: "Caixa Listras Vintage",
      description:
        "Caixa retangular dupla em listras pastel azul-rosa com rosa pintada à mão, base em poá delicado.",
      priceCents: 5500,
      quantity: 5,
      widthMm: 220,
      heightMm: 140,
      depthMm: 120,
      color: "rosa-azul",
      coverUrl: "/catalogo/listras-vintage-0.jpeg",
      tags: ["caixa", "listras", "vintage"],
    },
    {
      slug: "shell-mini-rosa",
      title: "Caixa Mini Rosa",
      description:
        "Caixa pequena cúbica com rosa pintada à mão e lacinho rosa cetim, base em palha texturizada cor creme.",
      priceCents: 3900,
      quantity: 8,
      widthMm: 110,
      heightMm: 110,
      depthMm: 80,
      color: "rosa-creme",
      coverUrl: "/catalogo/mini-rosa-0.jpeg",
      tags: ["caixa", "mini", "rosa"],
    },
    {
      slug: "shell-manual-padrinhos",
      title: "Caixa Manual dos Padrinhos",
      description:
        "Caixa de madrinhas/padrinhos em papel floral azul, com manual ilustrado em rosas azuis e almofadinha branca para a aliança com pingente azul-cristal.",
      priceCents: 14900,
      quantity: 3,
      widthMm: 230,
      heightMm: 230,
      depthMm: 95,
      color: "azul-floral",
      coverUrl: "/catalogo/manual-padrinhos-0.jpeg",
      tags: ["caixa", "padrinhos", "casamento"],
    },
  ];

  const shellRows = await Promise.all(
    shells.map(async (s) => {
      const [row] = await db
        .insert(Product)
        .values({
          type: "template_box",
          slug: s.slug,
          title: s.title,
          description: s.description,
          priceCents: s.priceCents,
          quantity: s.quantity,
          lowStockThreshold: 1,
          color: s.color,
          widthMm: s.widthMm,
          heightMm: s.heightMm,
          depthMm: s.depthMm,
          tags: s.tags,
          hidden: true,
        })
        .returning();
      if (!row) throw new Error(`seed: shell insert failed (${s.slug})`);
      await db.insert(ProductMedia).values({
        productId: row.id,
        kind: "image" as const,
        url: s.coverUrl,
        alt: `${s.title} — caixa fechada`,
        sortOrder: 0,
      });
      return row;
    }),
  );

  const shellBySlug = Object.fromEntries(shellRows.map((r) => [r.slug, r]));

  console.log("seed: caixas MDF cruas (públicas, /encomenda)");

  type MdfShellInput = {
    slug: string;
    title: string;
    description: string;
    priceCents: number;
    quantity: number;
    widthMm: number;
    heightMm: number;
    depthMm: number;
    photos: string[];
    tags: string[];
  };

  const mdfShells: MdfShellInput[] = [
    {
      slug: "mdf-mini-quadrada",
      title: "MDF Cru — Mini Quadrada",
      description:
        "Caixa cúbica em MDF cru (11×11×8cm). Ideal para mimos pequenos: pulseiras, anéis, bilhete dobrado.",
      priceCents: 2500,
      quantity: 12,
      widthMm: 110,
      heightMm: 110,
      depthMm: 80,
      photos: [
        "/catalogo/mdf/mdf-mini-quadrada.jpg",
        "/catalogo/mdf/mdf-mini-quadrada-1.jpg",
      ],
      tags: ["mdf", "cru", "mini", "quadrada"],
    },
    {
      slug: "mdf-quadrada-media",
      title: "MDF Cru — Quadrada Média",
      description:
        "Caixa MDF quadrada média (20×20×8cm). Boa para perfume, conjunto de joias ou dois mimos lado a lado.",
      priceCents: 4500,
      quantity: 10,
      widthMm: 200,
      heightMm: 200,
      depthMm: 80,
      photos: [
        "/catalogo/mdf/mdf-quadrada-media.jpg",
        "/catalogo/mdf/mdf-quadrada-media-1.jpg",
      ],
      tags: ["mdf", "cru", "media", "quadrada"],
    },
    {
      slug: "mdf-quadrada-grande",
      title: "MDF Cru — Quadrada Grande",
      description:
        "Caixa MDF quadrada grande (22×22×10cm). Espaço para kit completo — pincéis, joalheiro, potinho de cristal.",
      priceCents: 5900,
      quantity: 8,
      widthMm: 220,
      heightMm: 220,
      depthMm: 95,
      photos: [
        "/catalogo/mdf/mdf-quadrada-grande.jpg",
        "/catalogo/mdf/mdf-quadrada-grande-1.jpg",
      ],
      tags: ["mdf", "cru", "grande", "quadrada"],
    },
    {
      slug: "mdf-retangular-media",
      title: "MDF Cru — Retangular Média",
      description:
        "Caixa MDF retangular (25×17×10cm) com fecho frontal. Clássica para presentes compostos.",
      priceCents: 5200,
      quantity: 9,
      widthMm: 250,
      heightMm: 170,
      depthMm: 95,
      photos: [
        "/catalogo/mdf/mdf-retangular-media.jpg",
        "/catalogo/mdf/mdf-retangular-media-1.jpg",
      ],
      tags: ["mdf", "cru", "media", "retangular"],
    },
    {
      slug: "mdf-retangular-slim",
      title: "MDF Cru — Retangular Slim",
      description:
        "Caixa MDF retangular slim (28×21×6,5cm) — formato livro. Para Bíblia, partituras, agenda ou caderno.",
      priceCents: 5500,
      quantity: 7,
      widthMm: 280,
      heightMm: 210,
      depthMm: 65,
      photos: [
        "/catalogo/mdf/mdf-retangular-slim.jpg",
        "/catalogo/mdf/mdf-retangular-slim-1.jpg",
      ],
      tags: ["mdf", "cru", "slim", "biblia", "retangular"],
    },
    {
      slug: "mdf-retangular-alta",
      title: "MDF Cru — Retangular Alta",
      description:
        "Caixa MDF retangular com profundidade extra (22×14×12cm). Abriga itens com volume — cristais, ursinhos.",
      priceCents: 5800,
      quantity: 6,
      widthMm: 220,
      heightMm: 140,
      depthMm: 120,
      photos: [
        "/catalogo/mdf/mdf-retangular-alta.jpg",
        "/catalogo/mdf/mdf-retangular-alta-1.jpg",
      ],
      tags: ["mdf", "cru", "alta", "retangular"],
    },
  ];

  for (const m of mdfShells) {
    const [row] = await db
      .insert(Product)
      .values({
        type: "template_box",
        slug: m.slug,
        title: m.title,
        description: m.description,
        priceCents: m.priceCents,
        quantity: m.quantity,
        lowStockThreshold: 2,
        color: "natural",
        widthMm: m.widthMm,
        heightMm: m.heightMm,
        depthMm: m.depthMm,
        tags: m.tags,
        hidden: false,
      })
      .returning();
    if (!row) throw new Error(`seed: mdf shell insert failed (${m.slug})`);
    await db.insert(ProductMedia).values(
      m.photos.map((url, i) => ({
        productId: row.id,
        kind: "image" as const,
        url,
        alt: `${m.title} — foto ${i + 1}`,
        sortOrder: i,
      })),
    );
  }

  console.log("seed: catalog bundles");

  type BundleInput = {
    slug: string;
    title: string;
    description: string;
    templateBoxSlug: string;
    priceCents: number;
    quantity: number;
    lowStockThreshold: number;
    images: string[];
    items: { productId: string; quantity?: number }[];
  };

  const bundles: BundleInput[] = [
    {
      slug: "sabedoria",
      title: "Sabedoria",
      description:
        "Caixa Sabedoria com Bíblia Sagrada NVA em capa rosa floral. Conjunto de cabeceira completo, perfeito para presentear quem ama os tempos quietos.",
      templateBoxSlug: "shell-sabedoria",
      priceCents: 19900,
      quantity: 4,
      lowStockThreshold: 1,
      images: [
        "/catalogo/sabedoria-0.jpeg",
        "/catalogo/sabedoria-1.jpeg",
        "/catalogo/sabedoria-2.jpeg",
      ],
      items: [{ productId: bibliaRosa.id }],
    },
    {
      slug: "azul-perolas",
      title: "Azul Pérolas",
      description:
        "Caixa Azul Pérolas com Bíblia Sagrada NVA em capa rosa floral. Acabamento sereno e elegante, ideal para presente de fé com elegância.",
      templateBoxSlug: "shell-azul-perolas",
      priceCents: 21900,
      quantity: 5,
      lowStockThreshold: 2,
      images: [
        "/catalogo/azul-perolas-0.jpeg",
        "/catalogo/azul-perolas-1.jpeg",
        "/catalogo/azul-perolas-2.jpeg",
      ],
      items: [{ productId: bibliaRosa.id }],
    },
    {
      slug: "rosa-jardim",
      title: "Rosa Jardim — Kit Beleza",
      description:
        "Caixa Rosa Jardim com kit completo: pincéis rosê com espelho, porta-joias rosê e potinho de cristal. Trio de cuidado em uma só caixa.",
      templateBoxSlug: "shell-rosa-jardim",
      priceCents: 22900,
      quantity: 5,
      lowStockThreshold: 2,
      images: [
        "/catalogo/rosa-jardim-0.jpeg",
        "/catalogo/rosa-jardim-1.jpeg",
        "/catalogo/rosa-jardim-2.jpeg",
      ],
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
        "Caixa Melodia de Rosas com colar coração delicado em ouro folheado com zircônia. Inspiração poética e mimo certeiro.",
      templateBoxSlug: "shell-melodia-rosas",
      priceCents: 14900,
      quantity: 5,
      lowStockThreshold: 2,
      images: [
        "/catalogo/melodia-rosas-0.jpeg",
        "/catalogo/melodia-rosas-1.jpeg",
      ],
      items: [{ productId: colarCoracao.id }],
    },
    {
      slug: "borboletas-salvia",
      title: "Borboletas Sálvia",
      description:
        "Caixa Borboletas Sálvia entregue vazia para receber seu mimo escolhido. Acabamento primaveril e leve.",
      templateBoxSlug: "shell-borboletas-salvia",
      priceCents: 9900,
      quantity: 3,
      lowStockThreshold: 1,
      images: ["/catalogo/borboletas-salvia-0.jpeg"],
      items: [],
    },
    {
      slug: "gaiola-dourada",
      title: "Gaiola Dourada",
      description:
        "Caixa Gaiola Dourada entregue vazia. Charme clássico em papel azul claro com gaiola desenhada e fecho dourado.",
      templateBoxSlug: "shell-gaiola-dourada",
      priceCents: 7900,
      quantity: 4,
      lowStockThreshold: 1,
      images: ["/catalogo/gaiola-dourada-0.jpeg"],
      items: [],
    },
    {
      slug: "listras-vintage",
      title: "Listras Vintage",
      description:
        "Caixa Listras Vintage entregue vazia para receber seu presente especial. Acabamento romântico em listras pastel.",
      templateBoxSlug: "shell-listras-vintage",
      priceCents: 6900,
      quantity: 5,
      lowStockThreshold: 2,
      images: ["/catalogo/listras-vintage-0.jpeg"],
      items: [],
    },
    {
      slug: "mini-rosa",
      title: "Mini Rosa",
      description:
        "Caixa Mini Rosa com pulseira coração verde-esmeralda em ouro folheado. Mimo discreto e impactante.",
      templateBoxSlug: "shell-mini-rosa",
      priceCents: 9900,
      quantity: 6,
      lowStockThreshold: 2,
      images: ["/catalogo/mini-rosa-0.jpeg", "/catalogo/mini-rosa-1.jpeg"],
      items: [{ productId: pulseiraVerde.id }],
    },
    {
      slug: "manual-padrinhos",
      title: "Manual dos Padrinhos",
      description:
        "Caixa de convite para padrinhos: manual ilustrado em rosas azuis, gravata cetim azul claro \"Para o grande dia!\" e almofadinha com aliança azul-cristal. Premium para casamentos.",
      templateBoxSlug: "shell-manual-padrinhos",
      priceCents: 24900,
      quantity: 3,
      lowStockThreshold: 1,
      images: [
        "/catalogo/manual-padrinhos-0.jpeg",
        "/catalogo/manual-padrinhos-1.jpeg",
      ],
      items: [
        { productId: manualPadrinhos.id },
        { productId: gravataAzul.id },
        { productId: almofadinhaAlianca.id },
      ],
    },
  ];

  for (const b of bundles) {
    const shell = shellBySlug[b.templateBoxSlug];
    if (!shell)
      throw new Error(
        `seed: missing shell for bundle ${b.slug} (${b.templateBoxSlug})`,
      );

    const [row] = await db
      .insert(Bundle)
      .values({
        source: "catalog",
        slug: b.slug,
        title: b.title,
        description: b.description,
        templateBoxId: shell.id,
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
    `seed: done — ${bundles.length} bundles, ${shells.length} bundle shells, ${mdfShells.length} MDF cruas, 9 child products, 3 coupons`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
