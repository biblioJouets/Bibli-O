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
    const id = parseInt(params.id);
    const body = await request.json();
    
    // Récupération de la session
    const session = await getServerSession(authOptions);

    // 👇 SECURITE : On convertit les deux ID en entiers pour être sûr que "5" == 5
    // Si pas de session OU si l'ID de la session ne correspond pas à l'ID de l'URL
    if (!session || parseInt(session.user.id) !== id) {
       return NextResponse.json({ error: "Non autorisé : Vous ne pouvez modifier que votre propre profil." }, { status: 401 });
    }
    
    const updatedUser = await updateUser(id, body);
    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error("Erreur API PUT:", error);
    return NextResponse.json({ error: "Erreur mise à jour" }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  return userController.delete(request, context);
}