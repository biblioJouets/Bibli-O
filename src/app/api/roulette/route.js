// src/app/api/roulette/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/core/database';

export async function POST(request) {
  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: 'Email requis.' }, { status: 400 });
    }

    // Tirage avant enregistrement : 0 = Perdu, 1 = Gain
    // 70% Perdu / 30% Gagné
    const resultIndex = Math.random() < 0.70 ? 0 : 1;
    const rouletteWin = resultIndex === 1;

    const existing = await prisma.newsletter_subscribers.findUnique({
      where: { email },
    });

    if (existing) {
      // Déjà joué à la roulette
      if (existing.rouletteWin !== null) {
        return NextResponse.json(
          { error: 'Cet email a déjà tenté sa chance !' },
          { status: 400 }
        );
      }

      // Inscrit newsletter sans avoir joué → une tentative autorisée
      await prisma.newsletter_subscribers.update({
        where: { email },
        data: { rouletteWin },
      });
    } else {
      await prisma.newsletter_subscribers.create({
        data: { email, rouletteWin },
      });
    }

    return NextResponse.json({ resultIndex });
  } catch (error) {
    console.error('❌ Erreur globale API Roulette :', error);
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
  }
}
