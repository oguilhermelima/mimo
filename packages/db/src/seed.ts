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

  console.log("seed: shells (template_box)");
  const [shellMedia] = await db
    .insert(Product)
    .values({
      type: "template_box",
      slug: "caixa-crua-media-mdf",
      title: "Caixa crua média (MDF)",
      description:
        "Caixa crua em MDF, formato médio — ideal para Bíblia + itens pequenos.",
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

  if (!shellMedia) throw new Error("seed: shell insert failed");

  console.log("seed: stamps");
  const [stampRosaFloral] = await db
    .insert(Stamp)
    .values({
      slug: "rosa-floral-cartao-postal",
      name: "Rosa Floral — cartão-postal",
      description:
        "Estampa rosa com motivos florais e cartão-postal vintage. Aplicada na tampa.",
      imageUrl: "/caixas/caixa-02.jpeg",
      priceCents: 1500,
      quantity: 18,
      lowStockThreshold: 4,
    })
    .returning();

  const [stampAzulPomba] = await db
    .insert(Stamp)
    .values({
      slug: "azul-pomba",
      name: "Azul Pomba do Espírito Santo",
      description:
        "Estampa em tons de azul com pomba do Espírito Santo e pérolas.",
      imageUrl: "/caixas/caixa-10.jpeg",
      priceCents: 1500,
      quantity: 14,
      lowStockThreshold: 3,
    })
    .returning();

  const [stampSabedoria] = await db
    .insert(Stamp)
    .values({
      slug: "sabedoria-borboleta",
      name: "Sabedoria — borboleta & flores",
      description: 'Estampa "Sabedoria" em madeira aplicada, borboleta + florais.',
      imageUrl: "/caixas/caixa-17.jpeg",
      priceCents: 1800,
      quantity: 10,
      lowStockThreshold: 3,
    })
    .returning();

  if (!stampRosaFloral || !stampAzulPomba || !stampSabedoria)
    throw new Error("seed: stamp insert failed");

  console.log("seed: content products");
  const [biblia] = await db
    .insert(Product)
    .values({
      type: "cosmetic",
      slug: "biblia-sagrada-nva-capa-rosa",
      title: "Bíblia Sagrada NVA — capa rosa (guirlanda)",
      description:
        "Bíblia Sagrada, tradução NVA (Nova Versão Almeida), Sociedade Bíblica. Capa em guirlanda de flores rosa.",
      priceCents: 8900,
      quantity: 12,
      lowStockThreshold: 3,
      tags: ["biblia", "nva"],
    })
    .returning();

  const [estojo] = await db
    .insert(Product)
    .values({
      type: "jewelry",
      slug: "estojo-porta-joias-rose",
      title: "Estojo porta-joias rosé",
      description: "Estojo compacto em couro sintético rosé com zíper dourado.",
      priceCents: 4500,
      quantity: 8,
      lowStockThreshold: 2,
      tags: ["joalheiro"],
    })
    .returning();

  const [pinceis] = await db
    .insert(Product)
    .values({
      type: "cosmetic",
      slug: "mini-kit-pinceis-rose",
      title: "Mini kit de pincéis rosé",
      description: "Kit com 5 pincéis rosé + espelho compacto.",
      priceCents: 3900,
      quantity: 15,
      lowStockThreshold: 3,
      tags: ["maquiagem", "pinceis"],
    })
    .returning();

  if (!biblia || !estojo || !pinceis)
    throw new Error("seed: content insert failed");

  console.log("seed: catalog bundles");
  const [bundleRosa] = await db
    .insert(Bundle)
    .values({
      source: "catalog",
      slug: "caixa-biblia-rosa-floral",
      title: "Caixa Bíblia — Rosa Floral",
      description:
        "Caixa artesanal com estampa rosa floral + Bíblia Sagrada NVA. Interior revestido em estilo postal delicado.",
      templateBoxId: shellMedia.id,
      stampId: stampRosaFloral.id,
      priceCents: 16900,
      quantity: 6,
      lowStockThreshold: 2,
    })
    .returning();

  const [bundleAzul] = await db
    .insert(Bundle)
    .values({
      source: "catalog",
      slug: "caixa-biblia-azul-pomba",
      title: "Caixa Bíblia — Azul Pomba",
      description:
        "Caixa azul com pomba do Espírito Santo + Bíblia Sagrada NVA.",
      templateBoxId: shellMedia.id,
      stampId: stampAzulPomba.id,
      priceCents: 17900,
      quantity: 4,
      lowStockThreshold: 2,
    })
    .returning();

  const [bundleSabedoria] = await db
    .insert(Bundle)
    .values({
      source: "catalog",
      slug: "caixa-sabedoria-kit-presente",
      title: "Caixa Sabedoria — Joalheiro + Maquiagem",
      description:
        'Caixa "Sabedoria" com estojo porta-joias rosé + mini kit de pincéis. Palha natural e espelho.',
      templateBoxId: shellMedia.id,
      stampId: stampSabedoria.id,
      priceCents: 22900,
      quantity: 3,
      lowStockThreshold: 2,
    })
    .returning();

  if (!bundleRosa || !bundleAzul || !bundleSabedoria)
    throw new Error("seed: bundle insert failed");

  await db.insert(BundleItem).values([
    { bundleId: bundleRosa.id, productId: biblia.id, quantity: 1, sortOrder: 0 },
    { bundleId: bundleAzul.id, productId: biblia.id, quantity: 1, sortOrder: 0 },
    { bundleId: bundleSabedoria.id, productId: estojo.id, quantity: 1, sortOrder: 0 },
    { bundleId: bundleSabedoria.id, productId: pinceis.id, quantity: 1, sortOrder: 1 },
  ]);

  console.log("seed: product media");
  const productImg = (
    productId: string,
    file: string,
    alt: string,
    sortOrder = 0,
  ) => ({
    productId,
    kind: "image" as const,
    url: `/caixas/${file}`,
    alt,
    sortOrder,
  });

  await db.insert(ProductMedia).values([
    productImg(shellMedia.id, "caixa-04.jpeg", "Caixa crua MDF média"),
    productImg(biblia.id, "caixa-01.jpeg", "Bíblia NVA capa rosa"),
    productImg(estojo.id, "caixa-16.jpeg", "Estojo porta-joias rosé"),
    productImg(pinceis.id, "caixa-11.jpeg", "Kit de pincéis rosé"),
  ]);

  console.log("seed: bundle media");
  const bundleImg = (
    bundleId: string,
    file: string,
    alt: string,
    sortOrder = 0,
  ) => ({
    bundleId,
    kind: "image" as const,
    url: `/caixas/${file}`,
    alt,
    sortOrder,
  });

  await db.insert(BundleMedia).values([
    // rosa
    bundleImg(bundleRosa.id, "caixa-01.jpeg", "Caixa Bíblia Rosa aberta com a Bíblia dentro"),
    bundleImg(bundleRosa.id, "caixa-02.jpeg", "Caixa Bíblia Rosa — outro ângulo", 1),
    bundleImg(bundleRosa.id, "caixa-03.jpeg", "Detalhe da Bíblia Rosa", 2),
    bundleImg(bundleRosa.id, "caixa-04.jpeg", "Lombada da Bíblia Rosa", 3),

    // azul
    bundleImg(bundleAzul.id, "caixa-10.jpeg", "Caixa Bíblia Azul aberta com pomba"),
    bundleImg(bundleAzul.id, "caixa-08.jpeg", "Caixa Bíblia Azul — Bíblia dentro", 1),
    bundleImg(bundleAzul.id, "caixa-05.jpeg", "Caixa Bíblia Azul detalhe", 2),
    bundleImg(bundleAzul.id, "caixa-06.jpeg", "Caixa Bíblia Azul fechada", 3),
    bundleImg(bundleAzul.id, "caixa-07.jpeg", "Caixa Bíblia Azul fechada — outro ângulo", 4),
    bundleImg(bundleAzul.id, "caixa-09.jpeg", "Caixa Bíblia Azul fechada", 5),
    bundleImg(bundleAzul.id, "caixa-14.jpeg", "Caixa Bíblia Azul ambiente", 6),

    // sabedoria
    bundleImg(bundleSabedoria.id, "caixa-17.jpeg", "Caixa Sabedoria aberta com estojo e pincéis"),
    bundleImg(bundleSabedoria.id, "caixa-11.jpeg", "Caixa Sabedoria com rosas", 1),
    bundleImg(bundleSabedoria.id, "caixa-12.jpeg", "Caixa Sabedoria entregando as flores", 2),
    bundleImg(bundleSabedoria.id, "caixa-16.jpeg", "Caixa Sabedoria detalhe dos itens", 3),
    bundleImg(bundleSabedoria.id, "caixa-13.jpeg", "Caixa Sabedoria fechada", 4),
    bundleImg(bundleSabedoria.id, "caixa-15.jpeg", "Caixa Sabedoria fechada — outro ângulo", 5),
  ]);

  console.log("seed: sample coupon");
  await db.insert(Coupon).values({
    code: "MAE10",
    discountType: "percent",
    discountValue: 10,
    scope: "global",
    maxUses: 100,
    active: true,
  });

  console.log("seed: done");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
