import { NextResponse } from 'next/server';
import { getUserOrders, canUserExchange } from '@/lib/modules/orders/order.service';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request, props) {
  try {
    // --- COMPATIBILITÉ NEXT.JS 15/16 ---
    // On attend que les paramètres soient prêts (Promise)
    const params = await props.params; 
    // -----------------------------------

    const userId = parseInt(params.id);

    // 1. Validation ID
    if (isNaN(userId)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    // 2. Sécurité (Session)
    const session = await getServerSession(authOptions);
    
    // On vérifie que l'utilisateur connecté demande bien SES propres commandes
    if (!session || parseInt(session.user.id) !== userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // 3. Récupération des commandes + garde d'échange (un seul roundtrip)
    const [orders, exchangeGuard] = await Promise.all([
      getUserOrders(userId),
      canUserExchange(userId),
    ]);

    return NextResponse.json({ orders, exchangeGuard }, { status: 200 });

  } catch (error) {
    console.error("🔴 ERREUR API:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}