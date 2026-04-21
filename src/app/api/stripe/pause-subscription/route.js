import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/core/database';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

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

    await stripe.subscriptions.update(activeOrder.stripeSubscriptionId, {
      pause_collection: { behavior: 'keep_as_draft' },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[pause-subscription]', error.message);
    return NextResponse.json({ error: error.message || 'Erreur interne' }, { status: 500 });
  }
}
