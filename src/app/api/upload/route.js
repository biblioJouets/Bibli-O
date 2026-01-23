import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request) {
  try {
    // 1. SÉCURITÉ : Vérifier l'authentification (Indispensable)
    // Seuls les utilisateurs connectés (ou Admin) peuvent uploader
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, message: "Non autorisé. Veuillez vous connecter." }, { status: 401 });
    }

    const data = await request.formData();
    const file = data.get('file');

    if (!file) {
      return NextResponse.json({ success: false, message: "Aucun fichier reçu" }, { status: 400 });
    }

    // 2. SÉCURITÉ : Validation du Type MIME (Liste Blanche Stricte)
    // On accepte uniquement les images sûres pour le web
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    
    if (!allowedTypes.includes(file.type)) {
       return NextResponse.json({ 
         success: false, 
         message: "Format non supporté. Utilisez JPG, PNG ou WebP." 
       }, { status: 400 });
    }

    // 3. SÉCURITÉ : Vérifier la taille (Max 5Mo)
    const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo
    if (file.size > MAX_SIZE) {
        return NextResponse.json({ success: false, message: "Fichier trop volumineux (Max 5Mo)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. SÉCURITÉ : Renommage Aléatoire (UUID)
    // On ne garde JAMAIS le nom d'origine (évite les failles type "hack.php.jpg" ou écrasements)
    const extension = path.extname(file.name); // ex: .jpg
    // crypto.randomUUID() est natif dans les versions récentes de Node.js (utilisées par Next 16)
    const uniqueName = `${crypto.randomUUID()}${extension}`;

    const uploadDir = path.join(process.cwd(), 'public/uploads');
    
    // Création du dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, uniqueName);

    await writeFile(filePath, buffer);
    console.log(`[UPLOAD SUCCESS] User: ${session.user.email} - File: ${uniqueName}`);

    return NextResponse.json({ success: true, url: `/uploads/${uniqueName}` });

  } catch (error) {
    console.error("[UPLOAD ERROR]", error);
    return NextResponse.json({ success: false, message: "Erreur serveur lors de l'upload" }, { status: 500 });
  }
}