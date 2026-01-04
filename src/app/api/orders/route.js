// src/app/api/orders/route.js
// API Route pour créer une commande

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { createOrder } from "@/lib/modules/orders/order.service"; // Ton service existant
import prisma from "@/lib/core/database";

export async function POST(req) {
  try {
    // 1. Vérifier la session (Sécurité)
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    // 2. Récupérer les infos envoyées par la page Paiement
    const body = await req.json();
    const { cartItems, totalAmount, shippingData } = body;

    // 3. Récupérer l'ID utilisateur via son email (plus sûr)
    const user = await prisma.users.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ message: "Utilisateur introuvable" }, { status: 404 });
    }

    // 4. Appeler ta fonction createOrder existante
    // Note: On adapte le format pour matcher ce que 'createOrder' attend
    const order = await createOrder(
      user.id,
      { items: cartItems }, // On simule la structure cartData
      parseFloat(totalAmount),
      shippingData
    );

    return NextResponse.json({ success: true, orderId: order.id }, { status: 201 });

  } catch (error) {
    console.error("Erreur API Order:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}