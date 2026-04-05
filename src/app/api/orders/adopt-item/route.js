/* src/app/api/orders/adopt-item/route.js */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { z } from 'zod';
import { createAdoptionSession } from '@/lib/modules/orders/order.service';

const bodySchema = z.object({
  orderId: z.number().int().positive(),
  productId: z.number().int().positive(),
});

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Paramètres invalides.', details: parsed.error.flatten() }, { status: 400 });
    }

    const { orderId, productId } = parsed.data;
    const userId = parseInt(session.user.id);

    const result = await createAdoptionSession(orderId, productId, userId);

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const status = err.status || 500;
    const message = err.message || 'Erreur interne du serveur.';
    console.error('[adopt-item] Erreur:', err);
    return NextResponse.json({ error: message }, { status });
  }
}
