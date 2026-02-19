//src/app/api/users/[id]/addresses/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/core/database";

// POST : Ajouter une adresse
export async function POST(req, { params }) {
  try {
    // CORRECTION : On attend la promesse params AVANT d'extraire l'id
    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id);
    
    const body = await req.json();

    // On regarde si l'utilisateur a déjà des adresses
    const existingAddresses = await prisma.address.findMany({ where: { userId } });
    
    // Si c'est sa première adresse, elle devient celle par défaut automatiquement
    const isFirstAddress = existingAddresses.length === 0;

    const newAddress = await prisma.address.create({
      data: {
        street: body.street,
        zipCode: body.postalCode, // Correspondance Frontend -> Backend
        city: body.city,
        country: body.country || "France",
        isDefault: isFirstAddress, // Par défaut si c'est la 1ère
        userId: userId,
      },
    });

    return NextResponse.json(newAddress);
  } catch (error) {
    console.error("Erreur POST address:", error);
    return NextResponse.json({ error: "Erreur création adresse" }, { status: 500 });
  }
}

// DELETE : Supprimer une adresse
export async function DELETE(req, { params }) {
  try {
    const { searchParams } = new URL(req.url);
    const addressId = parseInt(searchParams.get("addressId"));

    await prisma.address.delete({
      where: { id: addressId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur suppression adresse" }, { status: 500 });
  }
}

// PUT : Définir comme adresse par défaut
export async function PUT(req, { params }) {
  try {
    // CORRECTION : On attend la promesse params AVANT d'extraire l'id
    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id);
    
    const { addressId } = await req.json();

    // 1. On remet TOUTES les adresses du user à 'isDefault = false'
    await prisma.address.updateMany({
      where: { userId: userId },
      data: { isDefault: false },
    });

    // 2. On met l'adresse sélectionnée à 'isDefault = true'
    await prisma.address.update({
      where: { id: parseInt(addressId) },
      data: { isDefault: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur PUT address:", error);
    return NextResponse.json({ error: "Erreur modification adresse" }, { status: 500 });
  }
}