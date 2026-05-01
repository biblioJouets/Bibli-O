import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const product = await prisma.products.upsert({
  where: { reference: 'BOX-MYSTERE' },
  update: { name: 'Box Mystère de Mai', price: 24.90, stock: 100 },
  create: {
    reference: 'BOX-MYSTERE',
    name: 'Box Mystère de Mai',
    slug: 'box-mystere-de-mai',
    description: "4 jouets surprises sélectionnés par notre équipe selon l'âge et le sexe de votre enfant.",
    price: 24.90,
    stock: 100,
    images: [],
    highlights: [],
    condition: 'NEW',
  },
});

console.log('✅ Produit BOX-MYSTERE créé/mis à jour :', product.id, product.name);
await prisma.$disconnect();
