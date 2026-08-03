// src/app/api/devis/route.js
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit, getRateLimitKey } from '@/lib/core/security/rateLimit';

// 1. SÉCURITÉ : Schéma de validation Zod adapté au devis
const devisSchema = z.object({
  name: z.string().min(2, "Le nom/agence doit contenir au moins 2 caractères").max(100),
  date: z.string().min(1, "La date est requise"),
  location: z.string().min(2, "Le lieu doit contenir au moins 2 caractères").max(150),
  details: z.string().min(10, "Les détails du projet doivent contenir au moins 10 caractères").max(2000),
});

export async function POST(request) {
  try {
    // 2. SÉCURITÉ : Rate Limiting (Anti-Spam)
    const ip = getRateLimitKey(request);
    const rateLimit = checkRateLimit(ip, 3); // 3 requêtes max par IP

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: "Trop de tentatives. Veuillez réessayer dans quelques minutes." },
        { status: 429 }
      );
    }

    // 3. SÉCURITÉ : Validation des Entrées (Zod)
    const body = await request.json();
    const validation = devisSchema.safeParse(body);
    
    if (!validation.success) {
      const errorMessage = validation.error.errors[0].message;
      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: 400 }
      );
    }

    const { name, date, location, details } = validation.data;

    // 4. ENVOI DE L'EMAIL VIA BREVO
    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY, // Assure-toi d'avoir cette variable dans ton .env
      },
      body: JSON.stringify({
        sender: {
          name: "Formulaire Devis Bibli'o Jouets",
          email: process.env.BREVO_SENDER_EMAIL // contact@bibliojouets.com
        },
        to: [
          {
            email: process.env.BREVO_SENDER_EMAIL, // Tu t'envoies l'email à toi-même pour traitement
            name: "Bibli'o Jouets"
          }
        ],
        subject: `Nouveau de demande de devis : ${name}`,
        htmlContent: `
          <div style="font-family: sans-serif; color: #2E1D21;">
            <h2>Nouvelle demande de devis sur mesure</h2>
            <p><strong>Nom / Agence :</strong> ${name}</p>
            <p><strong>Date de l'événement :</strong> ${date}</p>
            <p><strong>Lieu :</strong> ${location}</p>
            <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;" />
            <h3>Détails du projet :</h3>
            <p style="white-space: pre-wrap;">${details}</p>
          </div>
        `,
      }),
    });

    if (!brevoResponse.ok) {
      throw new Error('Erreur lors de l\'envoi via Brevo');
    }

    return NextResponse.json(
      { success: true, message: "Devis envoyé avec succès." },
      { status: 200 }
    );

  } catch (error) {
    console.error("Erreur API Devis:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur lors de l'envoi." }, 
      { status: 500 }
    );
  }
}