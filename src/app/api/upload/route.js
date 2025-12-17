import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('file');

    if (!file) {
      return NextResponse.json({ success: false, message: "Aucun fichier reçu" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Nettoyage du nom de fichier
    const originalName = file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '');
    const filename = Date.now() + '-' + originalName;

    // --- CORRECTION CHEMIN ABSOLU ---
    // On utilise process.cwd() pour être sûr d'être à la racine du projet dans Docker
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    
    // On s'assure que le dossier existe (au cas où)
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);

    console.log(`[UPLOAD DEBUG] Sauvegarde vers : ${filePath}`);

    // Écriture du fichier
    await writeFile(filePath, buffer);
    console.log(`[UPLOAD DEBUG] Succès !`);

    // Retourne l'URL relative pour la BDD
    return NextResponse.json({ success: true, url: `/uploads/${filename}` });

  } catch (error) {
    console.error("[UPLOAD ERROR]", error);
    return NextResponse.json({ success: false, message: "Erreur serveur upload" }, { status: 500 });
  }
}