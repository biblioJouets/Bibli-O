import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Stripe from "stripe";
import prisma from "@/lib/core/database";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json({ error: "orderId requis" }, { status: 400 });
  }

  const order = await prisma.orders.findUnique({
    where: { id: parseInt(orderId) },
    select: { stripeInvoiceUrl: true, stripeSubscriptionId: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }

  // URL déjà en BDD
  if (order.stripeInvoiceUrl) {
    return NextResponse.json({ url: order.stripeInvoiceUrl });
  }

  // Fallback : récupérer la dernière facture payée via l'abonnement Stripe
  if (!order.stripeSubscriptionId) {
    return NextResponse.json({ url: null });
  }

  try {
    const invoices = await stripe.invoices.list({
      subscription: order.stripeSubscriptionId,
      limit: 1,
      status: "paid",
    });

    const invoice = invoices.data[0];
    if (!invoice?.hosted_invoice_url) {
      return NextResponse.json({ url: null });
    }

    // Persister en BDD pour les prochaines requêtes
    await prisma.orders.update({
      where: { id: parseInt(orderId) },
      data: { stripeInvoiceUrl: invoice.hosted_invoice_url },
    });

    // Persister aussi dans StripeInvoice si absent
    if (invoice.id && order.userId !== undefined) {
      const fullOrder = await prisma.orders.findUnique({
        where: { id: parseInt(orderId) },
        select: { userId: true },
      });
      if (fullOrder?.userId) {
        await prisma.stripeInvoice.upsert({
          where: { stripeInvoiceId: invoice.id },
          update: {
            hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
            invoicePdf: invoice.invoice_pdf ?? null,
          },
          create: {
            stripeInvoiceId: invoice.id,
            stripeSubId: order.stripeSubscriptionId,
            userId: fullOrder.userId,
            amountPaid: invoice.amount_paid ?? 0,
            currency: invoice.currency ?? "eur",
            status: invoice.status ?? "paid",
            invoiceNumber: invoice.number ?? null,
            hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
            invoicePdf: invoice.invoice_pdf ?? null,
            periodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
            periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
          },
        });
      }
    }

    return NextResponse.json({ url: invoice.hosted_invoice_url });
  } catch (err) {
    console.error("[Admin Invoice] Erreur Stripe:", err.message);
    return NextResponse.json({ url: null });
  }
}
