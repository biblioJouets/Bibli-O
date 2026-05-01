import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from 'zod';
import prisma from '@/lib/core/database';

const bodySchema = z.object({
  orderId:   z.number().int().positive(),
  productId: z.number().int().positive(),
});

// Même logique que le webhook : ajoute exactement 1 mois calendaire
function addOneMonth(date) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  return d;
}

function formatDateFR(date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

async function sendBrevoEmail(toEmail, toName, templateId, params) {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: process.env.BREVO_SENDER_NAME || "Bibli'o Jouets",
          email: process.env.BREVO_SENDER_EMAIL,
        },
        to: [{ email: toEmail, name: toName }],
        templateId,
        params,
      }),
    });
    if (!response.ok) {
      const err = await response.json();
      console.error('[PROLONG] Erreur Brevo:', JSON.stringify(err));
    }
  } catch (err) {
    console.error('[PROLONG] Exception Brevo:', err);
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }
    const { orderId, productId } = parsed.data;

    // Récupère la commande + user + le jouet ciblé en une seule requête
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        Users: true,
        OrderProducts: {
          where: { ProductId: productId },
          include: { Products: true },
        },
      },
    });

    if (!order || order.Users?.email !== session.user.email) {
      return NextResponse.json({ error: "Action interdite" }, { status: 403 });
    }

    const orderProduct = order.OrderProducts[0];
    if (!orderProduct) {
      return NextResponse.json({ error: "Jouet introuvable dans la commande" }, { status: 404 });
    }

    // Mise à jour de l'intention UNIQUEMENT pour ce jouet précis
    await prisma.orderProducts.update({
      where: {
        OrderId_ProductId: {
          OrderId: orderId,
          ProductId: productId,
        },
      },
      data: { renewalIntention: 'PROLONGATION' },
    });

    // Calcul des dates pour l'email — cohérent avec le webhook (addOneMonth)
    const nextBillingDate = orderProduct.nextBillingDate;
    const nouvelleDate    = nextBillingDate ? addOneMonth(nextBillingDate) : null;

    const prenom = order.Users.firstName || order.shippingName?.split(' ')[0] || 'Client(e)';
    const jouet  = orderProduct.Products?.name || 'Jouet';

    await sendBrevoEmail(order.Users.email, prenom, 13, {
      prenom,
      jouet,
      dateRenouvellement: nextBillingDate ? formatDateFR(nextBillingDate) : 'Non définie',
      nouvelleDate:       nouvelleDate    ? formatDateFR(nouvelleDate)    : 'Non définie',
    });

    return NextResponse.json({ success: true, message: "Jouet prolongé avec succès." }, { status: 200 });
  } catch (error) {
    console.error("Erreur API Prolongation Jouet:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}