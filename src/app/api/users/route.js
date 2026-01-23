// src/app/api/users/route.js

import { NextResponse } from 'next/server';
import { userController } from '@/lib/modules/users/user.controller';
import { z } from 'zod';
import { checkRateLimit, getRateLimitKey } from '@/lib/core/security/rateLimit';

// Schéma de validation pour l'inscription
const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit faire 8 caractères minimum"),
  firstName: z.string().min(2, "Le prénom est trop court"),
  lastName: z.string().min(2, "Le nom est trop court"),
  phone: z.string().optional(),
});

// POST /api/users - Inscription
export async function POST(request) {
  try {
    // 1. SÉCURITÉ : Rate Limiting (Anti-Bruteforce création de compte)
    const ip = getRateLimitKey(request);
    const rateLimit = checkRateLimit(ip, 5); // 5 tentatives par minute max

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: "Trop de tentatives d'inscription. Réessayez plus tard." },
        { status: 429 }
      );
    }

    // 2. SÉCURITÉ : Validation Zod
    // Attention : il faut cloner la requête ou lire le body ici pour valider
    const body = await request.json(); 
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.errors[0].message },
        { status: 400 }
      );
    }
    // 3. Traitement : Appel du contrôleur avec les données validées
    const newRequest = new Request(request.url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: request.headers
    });
    
    return userController.create(newRequest);

  } catch (error) {
    console.error("Erreur API Users:", error);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}

// GET /api/users - Désactivé (Sécurité)
export async function GET(request) {
  return NextResponse.json(
    { success: false, message: "Accès non autorisé." },
    { status: 403 }
  );
}