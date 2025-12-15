//Route API pour l'interception des demandes vers /uploads ( notice des jouets )

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
    // 1. Récupérer le nom du fichier depuis l'URL
    const { filename } = params;

    // 2. Construire le chemin absolu vers le fichier sur le serveur (Docker)
    const filePath = path.join(process.cwd(), 'public/uploads', filename);

    try {
        // 3. Vérifier si le fichier existe réellement
        if (!fs.existsSync(filePath)) {
            return new NextResponse("Fichier non trouvé", { status: 404 });
        }

        // 4. Lire le fichier
        const fileBuffer = fs.readFileSync(filePath);

        // 5. Déterminer le type MIME (PDF, Image, etc.)
        const ext = path.extname(filename).toLowerCase();
        let contentType = 'application/octet-stream';

        if (ext === '.pdf') contentType = 'application/pdf';
        else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.png') contentType = 'image/png';
        else if (ext === '.webp') contentType = 'image/webp';
        else if (ext === '.svg') contentType = 'image/svg+xml';

        // 6. Renvoyer le fichier au navigateur
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                // Optionnel : Cache pour améliorer les perfs
                'Cache-Control': 'public, max-age=3600, must-revalidate',
            },
        });

    } catch (error) {
        console.error("Erreur lecture fichier upload:", error);
        return new NextResponse("Erreur serveur", { status: 500 });
    }
}