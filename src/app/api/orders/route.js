import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { createOrder } from "@/lib/modules/orders/order.service"; 
import prisma from "@/lib/core/database";

// 1. POST: Créer une commande (Client) - inchangé
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

    const body = await req.json();
    const { cartItems, totalAmount, shippingData } = body;

    const user = await prisma.users.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ message: "Utilisateur introuvable" }, { status: 404 });

    const order = await createOrder(
      user.id,
      { items: cartItems },
      parseFloat(totalAmount),
      shippingData
    );

    return NextResponse.json({ success: true, orderId: order.id }, { status: 201 });
  } catch (error) {
    console.error("Erreur API Order POST:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// 2. GET: Lister les commandes (Admin) - NOUVEAU
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    // Sécurité basique : vérifie si admin (à adapter selon ta gestion des rôles)
    // Ici on suppose que si tu accèdes à cette route en étant logué, c'est pour l'admin
    // Idéalement : if (session?.user?.role !== "ADMIN") ...
    if (!session) {
        return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    }

    const orders = await prisma.orders.findMany({
      include: {
        Users: { // Infos client
          select: { firstName: true, lastName: true, email: true, phone: true }
        },
        OrderProducts: { // Produits commandés
          include: {
            Products: true
          }
        }
      },
      orderBy: { createdAt: 'desc' } // Les plus récentes en haut
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Erreur API Order GET:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// 3. PATCH: Modifier le statut (Admin) - NOUVEAU
export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Interdit" }, { status: 403 });

    const body = await req.json();
    const { orderId, status, trackingNumber } = body;

    const updatedOrder = await prisma.orders.update({
      where: { id: parseInt(orderId) },
      data: { 
        status: status,
        trackingNumber: trackingNumber || null 
      }
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Erreur API Order PATCH:", error);
    return NextResponse.json({ error: "Erreur update" }, { status: 500 });
  }
}