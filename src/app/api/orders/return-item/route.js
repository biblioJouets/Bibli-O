import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { z } from 'zod';
import { processReturn } from '@/lib/modules/orders/order.service';

const bodySchema = z.object({
  orderId: z.number().int().positive(),
  productId: z.number().int().positive(),
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

    const { orderId, productId } = parsed.data;
    const result = await processReturn(orderId, productId, session.user.id);

    return NextResponse.json(
      { success: true, message: "Retour enregistré. Votre abonnement sera résilié en fin de période.", ...result },
      { status: 200 }
    );
  } catch (error) {
    const status = error.status ?? 500;
    console.error("[return-item]", error.message);
    return NextResponse.json({ error: error.message || "Erreur interne" }, { status });
  }
}
