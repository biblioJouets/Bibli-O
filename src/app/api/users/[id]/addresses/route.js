import { NextResponse } from 'next/server';
import prisma from '@/lib/core/database'; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request, { params }) {
  try {
    // 1. FIX NEXT.JS 15 : On attend les params
    const { id } = await params;
    const userId = parseInt(id);

    const body = await request.json();

    // 2. Sécurité : Vérifier la session
    const session = await getServerSession(authOptions);
    
    // On convertit les IDs en nombres pour être sûr de la comparaison
    if (!session || parseInt(session.user.id) !== userId) {
       return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // 3. Validation
    if (!body.street || !body.city || !body.postalCode) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    // 4. Création dans la BDD (CORRECTION DU NOM DU CHAMP)
    const newAddress = await prisma.address.create({ 
      data: {
        street: body.street,
        zipCode: body.postalCode, // <--- ICI : On map 'postalCode' (du front) vers 'zipCode' (de la BDD)
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