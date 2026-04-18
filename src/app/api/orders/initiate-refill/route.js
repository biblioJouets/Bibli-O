import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { z } from 'zod';
import { initiateRefill } from '@/lib/modules/orders/order.service';

const cartItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity:  z.number().int().min(1).default(1),
});

const shippingSchema = z.object({
  shippingName:        z.string().min(1),
  shippingAddress:     z.string().min(1),
  shippingZip:         z.string().min(1),
  shippingCity:        z.string().min(1),
  shippingPhone:       z.string().optional().nullable(),
  mondialRelayPointId: z.string().optional().nullable(),
}).optional().nullable();

const bodySchema = z.object({
  sourceOrderId: z.number().int().positive(),
  newCartItems:  z.array(cartItemSchema).min(1),
  shipping:      shippingSchema,
});

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { sourceOrderId, newCartItems, shipping } = parsed.data;

    const result = await initiateRefill(
      sourceOrderId,
      session.user.id,
      newCartItems,
      shipping ?? null
    );

    return NextResponse.json(
      { success: true, refillOrderId: result.refillOrderId, message: "Réassort initié ! Votre nouveau jouet est en préparation." },
      { status: 200 }
    );
  } catch (error) {
    const status = error.status ?? 500;
    console.error("[initiate-refill]", error.message);
    return NextResponse.json({ error: error.message || "Erreur interne" }, { status });
  }
}
