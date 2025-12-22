import { userController } from '@/lib/modules/users/user.controller';
import { NextResponse } from 'next/server';
import { updateUser } from '@/lib/modules/users/user.service';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 

export async function GET(request, context) {
  return userController.getById(request, context);
}

export async function PUT(request, { params }) {
  try {
    // --- FIX NEXT.JS 15 : On doit attendre params ---
    const resolvedParams = await params; 
    const id = parseInt(resolvedParams.id);
    
    // Vérification ID valide
    if (isNaN(id)) {
        return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    const body = await request.json();
    
    // --- SÉCURITÉ : Vérifier que c'est bien l'utilisateur connecté ---
    const session = await getServerSession(authOptions);
    if (!session || parseInt(session.user.id) !== id) {
       return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    
    // Appel au service (qui va nettoyer les données, voir étape 2)
    const updatedUser = await updateUser(id, body);
    
    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error("ERREUR API PUT:", error);
    return NextResponse.json({ error: "Erreur mise à jour profil" }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  return userController.delete(request, context);
}