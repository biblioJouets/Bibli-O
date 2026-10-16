// src/app/api/roulette/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Utilisation d'un singleton pour éviter de saturer les connexions PostgreSQL en dev
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(request) {
  try {
    const body = await request.json();
    // On nettoie l'email (espaces et majuscules) pour éviter les contournements
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: 'Email requis.' }, { status: 400 });
    }

    try {
      // Enregistrement dans la table newsletter_subscribers conservé
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

    // Tirage au sort : uniquement 0 (Oups raté) ou 1 (Gain Bibli'o)
    // Ici réglé sur 70% Perdu (< 0.70) et 30% Gagné (>= 0.70).
    // (Mets 0.50 si tu veux 50% de chance de gagner, ou 0.60 pour 40% de chance de gagner)
    const random = Math.random();
    const resultIndex = random < 0.70 ? 0 : 1;

    return NextResponse.json({ resultIndex });
  } catch (error) {
    // Log de l'erreur globale dans le terminal
    console.error("❌ Erreur globale API Roulette :", error);
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
  }
}