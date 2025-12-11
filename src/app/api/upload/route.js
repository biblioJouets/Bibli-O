import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('file');

    if (!file) {
      return NextResponse.json({ success: false, message: "Aucun fichier fourni" }, { status: 400 });
    }

    // Convertir le fichier en Buffer (données brutes)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sécuriser le nom du fichier (Timestamp + nom nettoyé)
    const filename = Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    
    // Définir le chemin de sauvegarde
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    
    // S'assurer que le dossier existe
    try {
        await mkdir(uploadDir, { recursive: true });
    } catch (e) {
        // Le dossier existe déjà, on continue
    }

    const filePath = path.join(uploadDir, filename);

    // Écrire le fichier sur le disque (dans le volume Docker)
    await writeFile(filePath, buffer);
    
    // Retourner l'URL publique
    const fileUrl = `/uploads/${filename}`;
    
    return NextResponse.json({ success: true, url: fileUrl });

  } catch (error) {
    console.error("Erreur serveur upload:", error);
    return NextResponse.json({ success: false, message: "Erreur lors de l'enregistrement du fichier" }, { status: 500 });
  }
}