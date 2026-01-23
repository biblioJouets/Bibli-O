import { NextResponse } from 'next/server';
import prisma from '@/lib/core/database';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request, props) {
  try {
    // 1. FIX NEXT.JS 16 : On attend les paramètres
    const params = await props.params;
    const orderId = parseInt(params.id);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: "ID de commande invalide" }, { status: 400 });
    }

    // 2. Sécurité : Qui est connecté ?
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // 3. Récupération de la commande
    // On garde tes "include" détaillés car ton front en a besoin (images, noms...)
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        OrderProducts: {
          include: {
            Product: true 
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    // 4. LE BLINDAGE SÉCURITÉ (IDOR + ADMIN) 🛡️
    // On vérifie : Est-ce le propriétaire OU est-ce un Admin ?
    
    // Note : On utilise toString() pour comparer les IDs proprement (Int vs String)
    const isOwner = order.userId.toString() === session.user.id.toString();
    const isAdmin = session.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
       return NextResponse.json({ error: "Accès interdit à cette commande" }, { status: 403 });
    }
    
    return NextResponse.json(order, { status: 200 });

  } catch (error) {
    console.error("Erreur API Single Order:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}