// src/app/api/auth/forgot-password/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/core/database'; // Ton instance prisma
import crypto from 'crypto';
// Importe ton service d'envoi de mail (Brevo ou Mailjet selon ta stack)
import { sendResetEmail } from '@/lib/core/brevo/client'; 

export async function POST(req) {
  try {
    const { email } = await req.json();

    // 1. Vérifier si l'utilisateur existe
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      // On répond OK même si l'user n'existe pas pour éviter le "User Enumeration Attack"
      return NextResponse.json({ message: "Si cet email existe, un lien a été envoyé." }, { status: 200 });
    }

    // 2. Générer un token sécurisé
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // Valide 1 heure

    // 3. Sauvegarder le token en DB
    await prisma.users.update({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });

    // 4. Créer le lien de reset
    // Attention: Change localhost par ton domaine en prod
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const resetUrl = `${baseUrl}/reset-password/${resetToken}`;

    console.log("Lien de reset (DEV ONLY) : ", resetUrl);

    // 5. Envoyer l'email
    // TODO: Décommenter et implémenter ton envoi d'email réel ici
    await sendResetEmail(user.email, resetUrl);

    return NextResponse.json({ message: "Email envoyé." }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}