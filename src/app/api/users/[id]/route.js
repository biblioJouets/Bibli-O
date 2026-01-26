// src/app/api/users/[id]/route.js
import { NextResponse } from 'next/server';
import { userService } from '@/lib/modules/users/user.service';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 

// --- GET : Récupérer un profil ---
export async function GET(request, { params }) {
  try {
    // 1. FIX NEXT.JS 16 : On attend les paramètres
    const resolvedParams = await params; 
    const id = parseInt(resolvedParams.id);

    // 2. Vérification session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, message: "Non autorisé" }, { status: 401 });
    }

    // 3. SÉCURITÉ IDOR BLINDÉE 🛡️
    const isAdmin = session.user.role === 'ADMIN';
    const isOwner = parseInt(session.user.id) === id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ success: false, message: "Accès interdit" }, { status: 403 });
    }

    // 4. Récupération via le Service
    const user = await userService.getById(id);

    if (!user) {
      return NextResponse.json({ success: false, message: "Utilisateur introuvable" }, { status: 404 });
    }

    // On retire le mot de passe avant d'envoyer
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({ success: true, data: userWithoutPassword });

  } catch (error) {
    console.error("Erreur GET user:", error);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}

// --- PUT : Modifier un profil ---
// --- PUT : Modifier un profil ---
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
        return NextResponse.json({ success: false, message: "ID invalide" }, { status: 400 });
    }

    const body = await request.json();
    const session = await getServerSession(authOptions);

    // SÉCURITÉ IDOR
    const isAdmin = session?.user?.role === 'ADMIN';
    const isOwner = session && parseInt(session.user.id) === id;

    if (!session || (!isOwner && !isAdmin)) {
       return NextResponse.json({ success: false, message: "Non autorisé" }, { status: 403 });
    }
    
    // 🛡️ SÉCURITÉ "MASS ASSIGNMENT" (NOUVEAU)
    // On définit strictement ce qu'un utilisateur peut modifier
    let dataToUpdate = {};

    // 1. Si c'est un ADMIN, il a le droit de tout changer (y compris le rôle)
    if (isAdmin) {
        dataToUpdate = { ...body };
    } 
    // 2. Si c'est l'utilisateur lui-même, on restreint les champs
    else {
        // Liste blanche des champs modifiables par l'utilisateur
        if (body.firstName) dataToUpdate.firstName = body.firstName;
        if (body.lastName) dataToUpdate.lastName = body.lastName;
        if (body.phone) dataToUpdate.phone = body.phone;
        if (body.email) dataToUpdate.email = body.email;
        // On NE prend PAS 'role', 'password', 'id', etc.
    }

    // Si aucune donnée valide n'est fournie
    if (Object.keys(dataToUpdate).length === 0) {
        return NextResponse.json({ success: false, message: "Aucune donnée modifiable fournie" }, { status: 400 });
    }
    
    const updatedUser = await userService.update(id, dataToUpdate);
    
    return NextResponse.json({ success: true, data: updatedUser });

  } catch (error) {
    console.error("Erreur PUT user:", error); // Log utile pour le debug
    return NextResponse.json({ success: false, message: "Erreur mise à jour" }, { status: 500 });
  }
}

// --- DELETE : Supprimer un compte ---
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    const session = await getServerSession(authOptions);

    // SÉCURITÉ
    const isAdmin = session?.user?.role === 'ADMIN';
    const isOwner = session && parseInt(session.user.id) === id;

    if (!session || (!isOwner && !isAdmin)) {
      return NextResponse.json({ success: false, message: "Non autorisé" }, { status: 403 });
    }

    await userService.delete(id);

    return NextResponse.json({ success: true, message: "Compte supprimé" });

  } catch (error) {
    return NextResponse.json({ success: false, message: "Erreur suppression" }, { status: 500 });
  }
}