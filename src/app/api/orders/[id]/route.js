/* Fichier : src/app/api/orders/[id]/route.js */
import { NextResponse } from 'next/server';
import prisma from "@/lib/core/database"; // On utilise Prisma directement ici pour être sûr
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Cette route sert à récupérer UNE SEULE commande via son ID (ex: /api/orders/100)
export async function GET(request, props) {
  try {
    // 1. Gestion des paramètres (Next.js 15/16)
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

    // 3. Récupération de la commande UNIQUE
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        OrderProducts: {
          include: {
            Product: true // On inclut les détails des produits
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    // 4. Vérification : Est-ce bien la commande de cet utilisateur ?
    // (Sauf si c'est un ADMIN, on pourrait ajouter cette condition plus tard)
    if (order.userId.toString() !== session.user.id.toString()) {
       return NextResponse.json({ error: "Accès interdit à cette commande" }, { status: 403 });
    }
    
    return NextResponse.json(order, { status: 200 });

  } catch (error) {
    console.error("Erreur API Single Order:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}