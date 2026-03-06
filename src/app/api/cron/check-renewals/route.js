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
      console.error(" Erreur Brevo:", errorData);
    }
  } catch (error) {
    console.error(" Exception Brevo:", error);
  }
}

function formatToyNames(names) {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  const last = names.pop();
  return names.join(", ") + " et " + last;
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
      const dbUser = await prisma.users.findUnique({ where: { id: order.userId } });
      if (!dbUser) continue;


      //recherche nom du client 
const userEmail = dbUser.email;
      
      // --- LOGIQUE ULTRA-ROBUSTE POUR LE PRÉNOM ---
      let prenom = "Client(e)";

      if (order.shippingName) {
        // S'il y a une adresse de livraison, on prend le premier mot (le prénom)
        prenom = order.shippingName.split(' ')[0];
      } else if (dbUser.firstName) {
        // Sinon, on prend le prénom officiel du compte utilisateur
        prenom = dbUser.firstName;
      }

      // Nettoyage (on enlève les espaces) et mise en majuscule de la 1ère lettre
      if (prenom && prenom.trim() !== "") {
        prenom = prenom.trim();
        prenom = prenom.charAt(0).toUpperCase() + prenom.slice(1).toLowerCase();
      } else {
        prenom = "Client(e)";
      }

      const toysJ7 = [];
      const toysJ2 = [];

      // On analyse chaque jouet de la commande
      for (const item of order.OrderProducts) {
        results.checked++;
        
        if (!item.nextBillingDate) continue;
        if (item.renewalIntention === 'RETOUR' || item.renewalIntention === 'PAIEMENT_ECHOUE') continue;

        const billingDate = new Date(item.nextBillingDate);
        billingDate.setHours(0, 0, 0, 0);
        
        const diffTime = billingDate.getTime() - today.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        const jouetName = item.Products.name;

        // On trie les jouets dans les bons paniers
        if (diffDays === 7) toysJ7.push(jouetName);
        if (diffDays === 2) toysJ2.push(jouetName);
      }

      // ---  ENVOI ALERTE J-7  ---
      if (toysJ7.length > 0) {
        const jouetsString = formatToyNames([...toysJ7]);
        await sendBrevoEmail(userEmail, prenom, 12, {
          prenom: prenom,
          jouet: jouetsString,
          lienCompte: `${appUrl}/mon-compte`
        });
        results.remindersJ7++;
        console.log(` [CRON] Relance J-7 envoyée pour [${jouetsString}] à ${userEmail}`);
      }

      // ---  ENVOI  RELANCE J-2 ---
      if (toysJ2.length > 0) {
        const jouetsString = formatToyNames([...toysJ2]);
        await sendBrevoEmail(userEmail, prenom, 15, {
          prenom: prenom,
          jouet: jouetsString,
          lienCompte: `${appUrl}/mon-compte`
        });
        results.remindersJ2++;
        console.log(` [CRON] Relance J-2 envoyée pour [${jouetsString}] à ${userEmail}`);
      }
    }

    return NextResponse.json({ success: true, results });

  } catch (error) {
    console.error(" CRON Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}