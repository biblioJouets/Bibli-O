import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/core/database";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// GET /api/user/stripe-balance — solde créditeur du client connecté
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const user = await prisma.users.findUnique({
    where: { id: parseInt(session.user.id) },
    select: { stripeCustomerId: true },
  });

  // Pas de customer Stripe = solde forcément nul
  if (!user?.stripeCustomerId) {
    return NextResponse.json({ balance: 0 });
  }

  const customer = await stripe.customers.retrieve(user.stripeCustomerId);

  // balance Stripe est négatif quand le client a du crédit (convention Stripe inversée)
  const credit = customer.deleted ? 0 : -customer.balance;

  return NextResponse.json({ balance: credit });
}
