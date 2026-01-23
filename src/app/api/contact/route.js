// src/app/api/contact/route.js
import { contactController } from '@/lib/modules/contact/contact.controller';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit, getRateLimitKey } from '@/lib/core/security/rateLimit';

// Schéma de validation Zod pour le contact
const contactSchema = z.object({
  email: z.string().email("Email invalide"),
  subject: z.string().min(3, "Le sujet doit contenir au moins 3 caractères"),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
  name: z.string().optional(), // Optionnel selon votre formulaire
});

export async function POST(request) {
  try {
    // 1. SÉCURITÉ : Rate Limiting (Anti-Spam)
    // On limite à 3 messages par minute pour éviter le flood
    const ip = getRateLimitKey(request);
    const rateLimit = checkRateLimit(ip, 3);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: "Trop de tentatives. Veuillez réessayer plus tard." },
        { status: 429 }
      );
    }

    // 2. SÉCURITÉ : Validation des Entrées (Zod)
    const body = await request.json();
    
    const validation = contactSchema.safeParse(body);
    
    if (!validation.success) {
      // On retourne la première erreur rencontrée pour guider l'utilisateur
      const errorMessage = validation.error.errors[0].message;
      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: 400 }
      );
    }

    // 3. Traitement : On passe la main au contrôleur avec des données propres
    return contactController.create(request);

  } catch (error) {
    console.error("Erreur API Contact:", error);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET(request) {
  return NextResponse.json({ success: true, message: 'Endpoint contact actif'});
}