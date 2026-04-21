import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/core/database';
import { getPriceIdForToyCount } from '@/lib/modules/orders/order.service';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { newToyCount } = await req.json();
    if (!newToyCount || newToyCount < 1 || newToyCount > 9) {
      return NextResponse.json({ error: 'Nombre de jouets invalide.' }, { status: 400 });
    }

    const newPriceId = getPriceIdForToyCount(newToyCount);
    if (!newPriceId) {
      return NextResponse.json({ error: `Aucune formule disponible pour ${newToyCount} jouet(s).` }, { status: 400 });
    }

    // Récupérer l'abonnement actif du client
    const activeOrder = await prisma.orders.findFirst({
      where: {
        userId: parseInt(session.user.id),
        status: 'ACTIVE',
        stripeSubscriptionId: { not: null },
      },
      select: { stripeSubscriptionId: true },
    });

    if (!activeOrder?.stripeSubscriptionId) {
      return NextResponse.json({ error: 'Aucun abonnement actif trouvé.' }, { status: 404 });
    }

    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const subscription = await stripe.subscriptions.retrieve(activeOrder.stripeSubscriptionId);
    const currentItemId = subscription.items.data[0]?.id;

    if (!currentItemId) {
      return NextResponse.json({ error: 'Impossible de récupérer les informations de l\'abonnement.' }, { status: 500 });
    }

    // Mise à jour vers le price inférieur — sans prorata (downgrade en fin de période)
    await stripe.subscriptions.update(activeOrder.stripeSubscriptionId, {
      items: [{ id: currentItemId, price: newPriceId }],
      proration_behavior: 'none',
    });

    const PRICING_MAP = { 1: 20, 2: 25, 3: 35, 4: 38, 5: 45, 6: 51, 7: 56, 8: 60, 9: 63 };
    const newPrice = PRICING_MAP[newToyCount] ?? null;

    return NextResponse.json({ success: true, newToyCount, newPrice }, { status: 200 });
  } catch (error) {
    console.error('[downgrade-subscription]', error.message);
    return NextResponse.json({ error: error.message || 'Erreur interne' }, { status: 500 });
  }
}
