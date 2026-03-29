import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { z } from 'zod';
import prisma from '@/lib/core/database';
import Stripe from 'stripe';
import { sendBrevoTemplate } from '@/lib/core/brevo/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const bodySchema = z.object({
  orderId: z.number().int().positive(),
});

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const { orderId } = parsed.data;

    // 1. Guard ownership & INCLUSION DES JOUETS
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: { 
        Users: true,
        OrderProducts: {
          include: { Products: true } // 💡 INDISPENSABLE pour récupérer le nom des jouets
        }
      },
    });

    if (!order || order.userId !== parseInt(session.user.id)) {
      return NextResponse.json({ error: "Action interdite" }, { status: 403 });
    }

    // 2. Guard statut
    if (!['ACTIVE', 'SHIPPED'].includes(order.status)) {
      return NextResponse.json({ error: "Cette commande ne peut pas être retournée." }, { status: 400 });
    }

    // 3. Appel Stripe
    if (order.stripeSubscriptionId) {
      await stripe.subscriptions.update(order.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    }

    // 4. Mise à jour en base (La commande ET les jouets)
    const updatedOrder = await prisma.orders.update({
      where: { id: orderId },
      data: {
        status: 'RETURNING',
      },
    });

    // 💡 AJOUT : On met à jour l'intention sur les jouets pour ton frontend
    await prisma.orderProducts.updateMany({
      where: { OrderId: orderId },
      data: {
        renewalIntention: 'RETOUR_DEMANDE'
      }
    });

    // 5. Email Brevo
    const user = order.Users;
    if (user?.email) {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = String(now.getFullYear()).slice(-2);
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const customOrderId = `CMD${day}${month}${year}${hours}${minutes}-${orderId}`;

      // 💡 AJOUT : Création de la chaîne de texte avec les noms des jouets
      const listeJouets = order.OrderProducts.map(op => op.Products.name).join(' / ');
      const lienEspaceClient = `${process.env.NEXT_PUBLIC_APP_URL || 'https://bibliojouets.com'}/mon-compte`;

      await sendBrevoTemplate(
        user.email,
        16, // Vérifie bien que l'ID 16 correspond à ce nouveau mail dans Brevo
        {
          // 💡 LES CLES CORRESPONDENT MAINTENANT EXACTEMENT AU HTML BREVO
          prenom: user.firstName || "Client(e)",
          orderId: customOrderId,
          jouets: listeJouets,
          lienCompte: lienEspaceClient
        }
      ).catch((err) =>
        console.error("[BREVO] Erreur envoi email retour:", err)
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Retour enregistré. Votre abonnement sera résilié en fin de période.",
        returnLabelUrl: updatedOrder.returnLabelUrl || null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Return API Error]:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}