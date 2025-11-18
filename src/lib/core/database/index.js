// lib/core/database/index.js
import { PrismaClient } from '@prisma/client';

// PrismaClient singleton pour éviter les connexions multiples
const globalForPrisma = global;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Test de connexion
export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Connexion Prisma + PostgreSQL réussie');
  } catch (error) {
    console.error('❌ Erreur de connexion Prisma :', error);
    process.exit(1);
  }
}

// Déconnexion propre
export async function disconnectDatabase() {
  await prisma.$disconnect();
}

// Export par défaut
export default prisma;