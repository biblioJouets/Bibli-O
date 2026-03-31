import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { z } from 'zod';
import { initiateExchange, upgradeAndExchange } from '@/lib/modules/orders/order.service';

const cartItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).default(1),
});

const bodySchema = z.object({
  orderId: z.number().int().positive(),
  newCartItems: z.array(cartItemSchema).min(1),
  // Si le client a confirmé l'upgrade depuis la modale
  confirmUpgrade: z.boolean().optional().default(false),
  newToyCount: z.number().int().min(1).max(9).optional(),
});

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 });
    }

    const { orderId, newCartItems, confirmUpgrade, newToyCount } = parsed.data;

    let result;
    if (confirmUpgrade && newToyCount) {
      result = await upgradeAndExchange(orderId, session.user.id, newCartItems, newToyCount);
    } else {
      result = await initiateExchange(orderId, session.user.id, newCartItems);
    }

    // Le service retourne requiresUpgrade: true si le panier dépasse l'abonnement actuel
    if (result.requiresUpgrade) {
      return NextResponse.json(result, { status: 200 });
    }

    return NextResponse.json({ success: true, message: "Échange initié ! Votre boîte navette est en préparation." }, { status: 200 });
  } catch (error) {
    const status = error.status ?? 500;
    console.error("[initiate-exchange]", error.message);
    return NextResponse.json({ error: error.message || "Erreur interne" }, { status });
  }
}
