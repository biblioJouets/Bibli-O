import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';
import { getServerSession } from "next-auth"; 

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('file');

    if (!file) {
      return NextResponse.json({ success: false, message: "Aucun fichier reçu" }, { status: 400 });
    }

    // 2. SÉCURITÉ : Vérifier le type de fichier (MIME Type)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
       return NextResponse.json({ success: false, message: "Type de fichier non autorisé (Images ou PDF uniquement)" }, { status: 400 });
    }

    // 3. SÉCURITÉ : Vérifier la taille (ex: Max 5Mo)
    const MAX_SIZE = 5 * 1024 * 1024; // 5Mo
    if (file.size > MAX_SIZE) {
        return NextResponse.json({ success: false, message: "Fichier trop volumineux (Max 5Mo)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Nettoyage du nom de fichier (Renforcé)
    // On garde l'extension originale mais on force le nom
    const extension = path.extname(file.name);
    const originalNameWithoutExt = path.basename(file.name, extension);
    const safeName = originalNameWithoutExt.replace(/[^a-zA-Z0-9]/g, ''); // Que des lettres/chiffres
    const filename = `${Date.now()}-${safeName}${extension}`;

    const uploadDir = path.join(process.cwd(), 'public/uploads');
    
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);
    console.log(`[UPLOAD SUCCESS] ${filename}`);

    return NextResponse.json({ success: true, url: `/uploads/${filename}` });

  } catch (error) {
    console.error("[UPLOAD ERROR]", error);
    return NextResponse.json({ success: false, message: "Erreur serveur upload" }, { status: 500 });
  }
}