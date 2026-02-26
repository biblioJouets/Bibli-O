//src/app/api/cron/check-renewals/route.js
// Ce fichier représente la route d'API que ton VPS (CRON) appellera tous les jours pour vérifier les renouvellements à venir.
// Il va analyser les commandes actives, détecter les dates anniversaires, et déclencher les actions nécessaires (envoi d'emails, passage en prolongation tacite, etc.)
import { NextResponse } from 'next/server';
import prisma from '@/lib/core/database';

export async function GET(request) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. On récupère les abonnements Actifs qui ont une date anniversaire
    const activeOrders = await prisma.orders.findMany({
      where: {
        status: 'ACTIVE',
        nextBillingDate: { not: null },
      },
      include: { Users: true } 
    });

    let stats = { j7: 0, j2: 0, j0_tacit: 0 };
    let debugInfo = []; // <--- NOTRE ESPION DE DEBUG

    for (const order of activeOrders) {
      const billingDate = new Date(order.nextBillingDate);
      billingDate.setHours(0, 0, 0, 0);

      // Calcul plus fiable avec Math.round()
      const diffTime = billingDate.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      // On enregistre ce que voit l'ordinateur
      debugInfo.push({
        orderId: order.id,
        userEmail: order.Users?.email || "Pas d'utilisateur lié",
        rawNextBillingDate: order.nextBillingDate,
        calculatedDiffDays: diffDays,
        intention: order.renewalIntention
      });

      // --- SCÉNARIO J-7 ---
      if (diffDays === 7 && !order.renewalIntention) {
        console.log(`[J-7] Détecté pour Commande ${order.id}`);
        stats.j7++;
      }

      // --- SCÉNARIO J-2 ---
      else if (diffDays === 2 && !order.renewalIntention) {
        stats.j2++;
      }

      // --- SCÉNARIO J-0 : PROLONGATION TACITE ---
      else if (diffDays === 0 && !order.renewalIntention) {
        await prisma.orders.update({
          where: { id: order.id },
          data: { renewalIntention: 'PROLONGATION_TACITE' }
        });
        stats.j0_tacit++;
      }
    }

    // On retourne le résultat avec l'espion
    return NextResponse.json({ 
      success: true, 
      message: "Analyse quotidienne terminée",
      stats,
      debug: debugInfo // <--- L'affichage de l'espion
    }, { status: 200 });

  } catch (error) {
    console.error("Erreur CRON Renewals:", error);
    return NextResponse.json({ error: "Erreur lors du traitement CRON" }, { status: 500 });
  }
}