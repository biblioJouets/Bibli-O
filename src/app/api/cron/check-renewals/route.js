import { NextResponse } from 'next/server';
import prisma from '@/lib/core/database';

// -------------------------------------------------------------------
// FONCTION UTILITAIRE : ENVOI D'EMAIL VIA BREVO
// -------------------------------------------------------------------
async function sendBrevoEmail(toEmail, toName, templateId, params) {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: { 
          name: process.env.BREVO_SENDER_NAME || "Bibli'o Jouets", 
          email: process.env.BREVO_SENDER_EMAIL 
        },
        to: [{ email: toEmail, name: toName }],
        templateId: templateId,
        params: params
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Erreur Brevo:", errorData);
    }
  } catch (error) {
    console.error("❌ Exception Brevo:", error);
  }
}

// -------------------------------------------------------------------
// ROUTE PRINCIPALE DU CRON
// -------------------------------------------------------------------
export async function GET(request) {
  // 1. SÉCURITÉ : Vérification du token
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 2. Récupération de toutes les commandes actives avec leurs jouets
    const orders = await prisma.orders.findMany({
      where: { status: 'ACTIVE' },
      include: { 
        OrderProducts: {
          include: { Products: true }
        }
      }
    });

    let results = { checked: 0, remindersJ7: 0, remindersJ2: 0 };
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // 3. Boucle d'analyse
    for (const order of orders) {
      // On récupère l'utilisateur pour avoir son email et son nom
      const dbUser = await prisma.users.findUnique({ where: { id: order.userId } });
      if (!dbUser) continue;

      const userEmail = dbUser.email;
      // On récupère le prénom depuis l'adresse de livraison ou le profil
      const prenom = order.shippingName ? order.shippingName.split(' ')[0] : (dbUser.name?.split(' ')[0] || "Client(e)");

      for (const item of order.OrderProducts) {
        results.checked++;
        
        if (!item.nextBillingDate) continue;

        // On ignore si le client a déjà demandé un retour ou si son paiement a échoué
        if (item.renewalIntention === 'RETOUR' || item.renewalIntention === 'PAIEMENT_ECHOUE') continue;

        // Calcul de la différence en jours
        const billingDate = new Date(item.nextBillingDate);
        billingDate.setHours(0, 0, 0, 0);
        
        const diffTime = billingDate.getTime() - today.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        const jouetName = item.Products.name;

        // --- 📧 ALERTE J-7 (Template ID: 12) ---
        if (diffDays === 7) {
          await sendBrevoEmail(userEmail, prenom, 12, {
            prenom: prenom,
            jouet: jouetName,
            lienCompte: `${appUrl}/mon-compte`
          });
          results.remindersJ7++;
          console.log(` [CRON] Relance J-7 envoyée pour ${jouetName} à ${userEmail}`);
        }

        // --- 📧 RELANCE J-2 (Template ID: 15) ---
        if (diffDays === 2) {
          await sendBrevoEmail(userEmail, prenom, 15, {
            prenom: prenom,
            jouet: jouetName,
            lienCompte: `${appUrl}/mon-compte`
          });
          results.remindersJ2++;
          console.log(` [CRON] Relance J-2 envoyée pour ${jouetName} à ${userEmail}`);
        }
      }
    }

    return NextResponse.json({ success: true, results });

  } catch (error) {
    console.error("[CRON] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}