import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import mime from 'mime'; // Tu n'as peut-être pas cette lib, on va faire sans pour être sûr

export async function GET(request, { params }) {
    // 1. Récupérer le nom du fichier
    const { filename } = params;

    // 2. Chemin absolu vers le dossier uploads (monté via Docker)
    const filePath = path.join(process.cwd(), 'public/uploads', filename);

    try {
        if (!fs.existsSync(filePath)) {
            return new NextResponse("Fichier non trouvé", { status: 404 });
        }

        // 3. Lire le fichier
        const fileBuffer = fs.readFileSync(filePath);

        // 4. Déterminer le type MIME manuellement (plus robuste sans dépendance externe)
        const ext = path.extname(filename).toLowerCase();
        let contentType = 'application/octet-stream';

        switch (ext) {
            case '.jpg':
            case '.jpeg':
                contentType = 'image/jpeg';
                break;
            case '.png':
                contentType = 'image/png';
                break;
            case '.gif':
                contentType = 'image/gif';
                break;
            case '.webp':
                contentType = 'image/webp';
                break;
            case '.svg':
                contentType = 'image/svg+xml';
                break;
            case '.pdf':
                contentType = 'application/pdf';
                break;
        }

        // 5. Renvoyer le fichier
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600, must-revalidate',
            },
        });

    } catch (error) {
        console.error("Erreur lecture fichier:", error);
        return new NextResponse("Erreur serveur", { status: 500 });
    }
}