// src/app/api/items/[itemId]/action/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { processItemAction } from '@/lib/modules/orders/item.service';

export async function POST(request, props) {
  try {
    const params = await props.params;
    const itemId = parseInt(params.itemId);
    
    // 1. Décodage du stimulus (récupération de l'action demandée)
    const body = await request.json();
    const { action } = body; // Valeurs attendues : 'EXCHANGE', 'ADOPT', 'EXTEND'

    // 2. Barrière de sécurité : Vérification stricte de l'identité
    const session = await getServerSession(authOptions);
    if (!session || !session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // 3. Validation rationnelle des données entrantes
    if (isNaN(itemId) || !['EXCHANGE', 'ADOPT', 'EXTEND'].includes(action)) {
      return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
    }

    // 4. Transmission à la couche de service métier
    const result = await processItemAction(itemId, session.user.id, action);

    return NextResponse.json({ success: true, data: result }, { status: 200 });

  } catch (error) {
    console.error("🔴 Erreur interne lors de l'action sur le jouet:", error);
    return NextResponse.json({ error: "L'action n'a pas pu aboutir" }, { status: 500 });
  }
}