//src/app/api/cron/check-renewals/route.js

import { NextResponse } from 'next/server';
import prisma from '@/lib/core/database';

export async function GET(request) {

  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error : "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. On récupère les JOUETS dont la commande est active et qui ont une date anniversaire
    const activeItems = await prisma.orderProducts.findMany({
      where: {
        nextBillingDate: { not: null },
        Orders: { status: 'ACTIVE' }
      },
      include: {
        Orders: { include: { Users: true } },
        Products: true
      }
    });

    let stats = { j7: 0, j2: 0, j0_tacit: 0 };
    let debugInfo = [];

    for (const item of activeItems) {
      const billingDate = new Date(item.nextBillingDate);
      billingDate.setHours(0, 0, 0, 0);

      const diffDays = Math.round((billingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      debugInfo.push({
        orderId: item.OrderId,
        productName: item.Products.name,
        diffDays: diffDays,
        intention: item.renewalIntention
      });

      // La logique reste exactement la même, mais s'applique à 'item' (le jouet)
      if (diffDays === 7 && !item.renewalIntention) {
        // Envoi email J-7 ("N'oubliez pas de rendre ou prolonger : [item.Products.name]")
        stats.j7++;
      }
      else if (diffDays === 0 && !item.renewalIntention) {
        // Prolongation tacite DU JOUET
        await prisma.orderProducts.update({
          where: { OrderId_ProductId: { OrderId: item.OrderId, ProductId: item.ProductId } },
          data: { renewalIntention: 'PROLONGATION_TACITE' }
        });
        stats.j0_tacit++;
      }
    }

    return NextResponse.json({ success: true, stats, debug: debugInfo }, { status: 200 });

  } catch (error) {
    console.error("Erreur CRON Renewals:", error);
    return NextResponse.json({ error: "Erreur lors du traitement CRON" }, { status: 500 });
  }
}