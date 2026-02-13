import { NextResponse } from 'next/server';
import prisma from '@/lib/core/database';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { token, password } = await req.json();

    // 1. Trouver l'utilisateur avec ce token valide
    const user = await prisma.users.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }, // Le token doit être encore valide (date future)
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Lien invalide ou expiré" }, { status: 400 });
    }

    // 2. Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Mettre à jour l'utilisateur et nettoyer le token
    await prisma.users.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({ message: "Mot de passe modifié" }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}