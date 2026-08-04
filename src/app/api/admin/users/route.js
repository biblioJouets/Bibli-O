// src/app/api/admin/users/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/core/database';

export async function GET(req) {
  try {
    // 1. Récupération des utilisateurs avec le modèle "users" (Pluriel dans Prisma)
    const users = await prisma.users.findMany({
      include: {
        Orders: true, // "Orders" avec majuscule comme défini dans ton schema.prisma
      },
    });

    // 2. Supprime le champ password pour des raisons de sécurité
    const safeUsers = users.map((user) => {
      const { password, resetToken, resetTokenExpiry, ...safeUser } = user;
      return safeUser;
    });

    // 3. Renvoi des données au format JSON
    return NextResponse.json(safeUsers, { status: 200 });

  } catch (error) {
    console.error("Erreur API /admin/users :", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des utilisateurs." },
      { status: 500 }
    );
  }
}