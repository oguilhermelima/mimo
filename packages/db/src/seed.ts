import { db } from "./client";
import { Product, ProductMedia } from "./schema";

async function main() {
  console.log("seed: wiping");
  await db.delete(ProductMedia);
  await db.delete(Product);

  console.log("seed: criando caixas reais");

  const [rosa] = await db
    .insert(Product)
    .values({
      slug: "caixa-biblia-rosa-floral",
      title: "Caixa Bíblia — Rosa Floral",
      description:
        "Caixa artesanal em papel texturizado com motivos florais e cartão-postal vintage. Interior revestido em estilo postal delicado. Acompanha Bíblia Sagrada NVA com capa em guirlanda rosa. Presente inesquecível para celebrar a fé.",
      priceCents: 16900,
      color: "rosa",
      widthMm: 220,
      heightMm: 170,
      depthMm: 70,
      tags: ["biblia", "rosa", "floral", "fé", "presente"],
    })
    .returning();

  const [azul] = await db
    .insert(Product)
    .values({
      slug: "caixa-biblia-azul-pomba",
      title: "Caixa Bíblia — Azul Pomba",
      description:
        "Caixa em tons de azul com pomba do Espírito Santo em estampa vintage, detalhes em pérola e laço de cetim. Interior com motivo aves/folhagens. Inclui Bíblia Sagrada NVA com capa em guirlanda rosa.",
      priceCents: 17900,
      color: "azul",
      widthMm: 240,
      heightMm: 180,
      depthMm: 75,
      tags: ["biblia", "azul", "pomba", "espirito-santo", "presente"],
    })
    .returning();

  const [sabedoria] = await db
    .insert(Product)
    .values({
      slug: "caixa-sabedoria-kit-presente",
      title: "Caixa Sabedoria — Joalheiro + Maquiagem",
      description:
        'Caixa estilo cartão-postal com a palavra "Sabedoria" em madeira aplicada, borboleta e motivos florais. Inclui estojo porta-joias rosé e mini kit de pincéis de maquiagem. Apresentada com palha natural e espelho. Um mimo completo para presentear.',
      priceCents: 22900,
      color: "rosa-claro",
      widthMm: 250,
      heightMm: 180,
      depthMm: 55,
      tags: ["sabedoria", "joalheiro", "maquiagem", "kit", "presente"],
    })
    .returning();

  if (!rosa || !azul || !sabedoria) throw new Error("seed parents failed");

  // filhos compositores
  await db.insert(Product).values([
    {
      slug: "biblia-sagrada-nva-capa-rosa",
      title: "Bíblia Sagrada NVA — capa rosa (guirlanda)",
      description:
        "Bíblia Sagrada, tradução NVA (Nova Versão Almeida), edição Sociedade Bíblica. Capa em guirlanda de flores rosa, acompanha as caixas.",
      priceCents: 8900,
      parentId: rosa.id,
      tags: ["biblia", "nva"],
    },
    {
      slug: "estojo-porta-joias-rose",
      title: "Estojo porta-joias rosé",
      description: "Estojo compacto em couro sintético rosé com zíper dourado.",
      priceCents: 4500,
      parentId: sabedoria.id,
      tags: ["joalheiro"],
    },
    {
      slug: "mini-kit-pinceis-rose",
      title: "Mini kit de pincéis rosé",
      description: "Kit com 5 pincéis rosé + espelho compacto.",
      priceCents: 3900,
      parentId: sabedoria.id,
      tags: ["maquiagem", "pinceis"],
    },
  ]);

  // mídia real — todas 1:1 (CSS object-cover corta 3:4 do WhatsApp)
  const img = (productId: string, file: string, alt: string, sortOrder = 0) => ({
    productId,
    kind: "image" as const,
    url: `/caixas/${file}`,
    alt,
    sortOrder,
  });

  await db.insert(ProductMedia).values([
    // rosa
    img(rosa.id, "caixa-01.jpeg", "Caixa Bíblia Rosa aberta com a Bíblia dentro"),
    img(rosa.id, "caixa-02.jpeg", "Caixa Bíblia Rosa — outro ângulo", 1),
    img(rosa.id, "caixa-03.jpeg", "Detalhe da Bíblia Rosa", 2),
    img(rosa.id, "caixa-04.jpeg", "Lombada da Bíblia Rosa", 3),

    // azul
    img(azul.id, "caixa-10.jpeg", "Caixa Bíblia Azul aberta com pomba"),
    img(azul.id, "caixa-08.jpeg", "Caixa Bíblia Azul — Bíblia dentro", 1),
    img(azul.id, "caixa-05.jpeg", "Caixa Bíblia Azul detalhe", 2),
    img(azul.id, "caixa-06.jpeg", "Caixa Bíblia Azul fechada", 3),
    img(azul.id, "caixa-07.jpeg", "Caixa Bíblia Azul fechada — outro ângulo", 4),
    img(azul.id, "caixa-09.jpeg", "Caixa Bíblia Azul fechada", 5),
    img(azul.id, "caixa-14.jpeg", "Caixa Bíblia Azul ambiente", 6),

    // sabedoria
    img(sabedoria.id, "caixa-17.jpeg", "Caixa Sabedoria aberta com estojo e pincéis"),
    img(sabedoria.id, "caixa-11.jpeg", "Caixa Sabedoria com rosas", 1),
    img(sabedoria.id, "caixa-12.jpeg", "Caixa Sabedoria entregando as flores", 2),
    img(sabedoria.id, "caixa-16.jpeg", "Caixa Sabedoria detalhe dos itens", 3),
    img(sabedoria.id, "caixa-13.jpeg", "Caixa Sabedoria fechada", 4),
    img(sabedoria.id, "caixa-15.jpeg", "Caixa Sabedoria fechada — outro ângulo", 5),
  ]);

  console.log("seed: done");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
