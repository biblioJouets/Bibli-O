import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
import prisma from '@/lib/core/database';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions); 
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { orderId, productId } = await req.json();

    // Vérification de sécurité (le user possède bien cette commande)
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: { Users: true }
    });

    if (!order || order.Users?.email !== session.user.email) {
      return NextResponse.json({ error: "Action interdite" }, { status: 403 });
    }

    // Mise à jour de l'intention UNIQUEMENT pour ce jouet précis !
    await prisma.orderProducts.update({
      where: {
        OrderId_ProductId: {
          OrderId: orderId,
          ProductId: productId,
        }
      },
      data: {
        renewalIntention: 'PROLONGATION',
      },
    });

    return NextResponse.json({ success: true, message: "Jouet prolongé avec succès." }, { status: 200 });
  } catch (error) {
    console.error("Erreur API Prolongation Jouet:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}