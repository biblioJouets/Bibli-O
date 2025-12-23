import { NextResponse } from 'next/server';
import prisma from '@/lib/core/database'; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    const body = await request.json();

    const session = await getServerSession(authOptions);
    
    if (!session || parseInt(session.user.id) !== userId) {
       return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (!body.street || !body.city || !body.postalCode) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    const newAddress = await prisma.address.create({ 
      data: {
        street: body.street,
        zipCode: body.postalCode,
        city: body.city,
        country: body.country || "France",
        userId: userId,
      },
    });

    return NextResponse.json(newAddress);

  } catch (error) {
    console.error("ERREUR ADD ADDRESS:", error);
    return NextResponse.json({ error: "Erreur serveur : " + error.message }, { status: 500 });
  }
}