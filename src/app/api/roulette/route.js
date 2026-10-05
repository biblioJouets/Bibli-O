import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Attention : Si tu as déjà une instance Prisma centralisée (ex: lib/prisma.ts), 
// il vaut mieux l'importer plutôt que d'en créer une nouvelle ici.
const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email requis.' }, { status: 400 });
    }

    try {
      await prisma.newsletter_subscribers.create({
        data: { email },
      });
    } catch (e) {
      if (e.code === 'P2002') {
        return NextResponse.json(
          { error: 'Cet email a déjà tenté sa chance !' }, 
          { status: 400 }
        );
      }
      // Log de l'erreur Prisma dans le terminal
      console.error("❌ Erreur Prisma lors de l'enregistrement :", e);
      throw e; 
    }

    const random = Math.random();
    let resultIndex = 0;

    if (random < 0.60) {
      resultIndex = 0; 
    } else if (random < 0.90) {
      resultIndex = 1; 
    } else {
      resultIndex = 2; 
    }

    return NextResponse.json({ resultIndex });
  } catch (error) {
    // Log de l'erreur globale dans le terminal
    console.error("❌ Erreur globale API Roulette :", error);
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
  }
}