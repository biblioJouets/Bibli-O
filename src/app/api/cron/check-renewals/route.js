import { NextResponse } from 'next/server';
import prisma from '@/lib/core/database';

// -------------------------------------------------------------------
// UTILITAIRES
// -------------------------------------------------------------------
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
      console.error('[CRON] Erreur Brevo:', JSON.stringify(err));
    }
  } catch (error) {
    console.error('[CRON] Exception Brevo:', error);
  }
}

// Immutable — ne mute pas le tableau source
function formatToyNames(names) {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} et ${names[1]}`;
  // Au-delà de 2 : "Jouet A, Jouet B et 2 autres"
  const MAX_NAMED = 2;
  const rest = names.length - MAX_NAMED;
  return `${names.slice(0, MAX_NAMED).join(', ')} et ${rest} autre${rest > 1 ? 's' : ''}`;
}

function getPrenom(order, dbUser) {
  let prenom = order.shippingName?.split(' ')[0] || dbUser.firstName || 'Client(e)';
  prenom = prenom.trim();
  return prenom ? prenom.charAt(0).toUpperCase() + prenom.slice(1).toLowerCase() : 'Client(e)';
}

// -------------------------------------------------------------------
// ROUTE CRON
// -------------------------------------------------------------------
export async function GET(request) {
  // Sécurité Bearer Token
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Récupère toutes les commandes ACTIVE avec leurs jouets actionnables et le user
    // en une seule requête (évite le N+1)
    const orders = await prisma.orders.findMany({
      where: { status: 'ACTIVE' },
      include: {
        Users: true,
        OrderProducts: {
          where: {
            nextBillingDate: { not: null },
            // NULL n'est pas évalué par NOT IN en SQL — on doit inclure explicitement le cas null
            OR: [
              { renewalIntention: null },
              { renewalIntention: { notIn: ['RETOUR_DEMANDE', 'PAIEMENT_ECHOUE', 'ADOPTE', 'ADOPTE_REMPLACE'] } },
            ],
          },
          include: { Products: true },
        },
      },
    });

    const results = { ordersChecked: 0, remindersJ7: 0, remindersJ2: 0 };

    for (const order of orders) {
      if (!order.Users) {
        console.log(`[CRON] Commande #${order.id} ignorée — utilisateur introuvable.`);
        continue;
      }

      const userEmail = order.Users.email;
      const prenom    = getPrenom(order, order.Users);
      const toysJ7    = [];
      const toysJ2    = [];

      for (const item of order.OrderProducts) {
        const billingDate = new Date(item.nextBillingDate);
        billingDate.setHours(0, 0, 0, 0);

        const diffTime = billingDate.getTime() - today.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        console.log(
          `[CRON] Commande #${order.id} — jouet "${item.Products.name}" — diffDays = ${diffDays}.`
        );

        if (diffDays === 7) toysJ7.push(item.Products.name);
        if (diffDays === 2) toysJ2.push(item.Products.name);

      }
      
      results.ordersChecked++;

      if (toysJ7.length === 0 && toysJ2.length === 0) {
        console.log(`[CRON] Commande #${order.id} analysée. Aucun rappel à envoyer.`);
        continue;
      }

      // Un seul email J-7 par commande
      if (toysJ7.length > 0) {
        const jouetsString = formatToyNames(toysJ7);
        console.log(`[CRON] Envoi email J-7 pour Commande #${order.id} (${userEmail}) — jouets : ${jouetsString}`);
        await sendBrevoEmail(userEmail, prenom, 12, {
          prenom,
          jouet: jouetsString,
          lienCompte: `${appUrl}/mon-compte`,
        });
        results.remindersJ7++;
      }

      // Un seul email J-2 par commande
      if (toysJ2.length > 0) {
        const jouetsString = formatToyNames(toysJ2);
        console.log(`[CRON] Envoi email J-2 pour Commande #${order.id} (${userEmail}) — jouets : ${jouetsString}`);
        await sendBrevoEmail(userEmail, prenom, 15, {
          prenom,
          jouet: jouetsString,
          lienCompte: `${appUrl}/mon-compte`,
        });
        results.remindersJ2++;
      }
    }

    console.log(`[CRON] Terminé — ${results.ordersChecked} commandes analysées, ${results.remindersJ7} J-7, ${results.remindersJ2} J-2.`);
    return NextResponse.json({ success: true, results });

  } catch (error) {
    console.error('[CRON] Erreur critique:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
