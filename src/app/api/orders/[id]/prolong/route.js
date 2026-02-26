import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/core/database';

export async function POST(req, { params }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // On doit "attendre" (await) les paramètres avant de les lire
    const resolvedParams = await params;
    const orderId = parseInt(resolvedParams.id, 10);

    // Vérification de la commande et de son propriétaire
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: { Users: true }
    });

    if (!order || order.Users?.email !== session.user.email) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    // Mise à jour de l'intention (notre fameuse horloge d'attente)
    await prisma.orders.update({
      where: { id: orderId },
      data: {
        renewalIntention: 'PROLONGATION',
      },
    });

    // TODO: Déclencher l'email transactionnel Mailjet/Brevo ici 
    // "Confirmation de votre choix de prolongation"

    return NextResponse.json({ 
      success: true, 
      message: "Choix enregistré avec succès. Le paiement se fera à la date anniversaire." 
    }, { status: 200 });

  } catch (error) {
    console.error("Erreur API Prolongation:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}