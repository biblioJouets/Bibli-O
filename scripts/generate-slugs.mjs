/**
 * Script one-shot : génère les slugs pour tous les produits existants en BDD.
 *
 * Usage :
 *   node scripts/generate-slugs.mjs
 *
 * À exécuter UNE SEULE FOIS après la migration Prisma (db:push ou migrate dev).
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[æ]/g, 'ae')
    .replace(/[œ]/g, 'oe')
    .replace(/[ø]/g, 'o')
    .replace(/[ß]/g, 'ss')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  const products = await prisma.products.findMany({
    select: { id: true, name: true, brand: true, slug: true },
  });

  console.log(`${products.length} produits trouvés.`);

  let updated = 0;
  let skipped = 0;

  for (const product of products) {
    if (product.slug) {
      skipped++;
      continue;
    }

    const brandSlug = slugify(product.brand || 'autre');
    const productSlug = slugify(product.name);
    const fullSlug = `${brandSlug}/${productSlug}`;

    // Vérifie l'unicité et suffixe avec l'id si collision
    const existing = await prisma.products.findFirst({
      where: { slug: fullSlug, id: { not: product.id } },
    });

    const finalSlug = existing ? `${fullSlug}-${product.id}` : fullSlug;

    await prisma.products.update({
      where: { id: product.id },
      data: {
        slug: finalSlug,
        brandSlug,
      },
    });

    console.log(`  [${product.id}] ${product.name} → /bibliotheque/${finalSlug}`);
    updated++;
  }

  console.log(`\nTerminé : ${updated} mis à jour, ${skipped} ignorés (slug déjà présent).`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
