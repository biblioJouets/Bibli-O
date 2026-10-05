// src/app/api/user/stripe-balance/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/core/database";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non connecté" }, { status: 401 });
    }

    // Récupération de la nouvelle variable 'giftCredit' dans le profil User
    const user = await prisma.users.findUnique({
      where: { id: parseInt(session.user.id, 10) },
      select: { giftCredit: true }
    });

    return NextResponse.json({ balance: user?.giftCredit || 0 });
  } catch (error) {
    console.error("Erreur fetch balance:", error);
    return NextResponse.json({ balance: 0 }, { status: 500 });
  }
}