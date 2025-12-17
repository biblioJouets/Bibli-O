import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
    try {
        const resolvedParams = await params;
        const filename = resolvedParams.filename;

        if (!filename) {
            return new NextResponse("Nom de fichier manquant", { status: 400 });
        }

        // Construction du chemin absolu
        const filePath = path.join(process.cwd(), 'public', 'uploads', filename);

        // Vérification de l'existence sur le disque
        if (!fs.existsSync(filePath)) {
            console.error(`[GET UPLOAD] Fichier introuvable sur le disque : ${filePath}`);
            return new NextResponse("Image non trouvée", { status: 404 });
        }

        // Lecture du fichier
        const fileBuffer = fs.readFileSync(filePath);

        // Détermination du type MIME
        const ext = path.extname(filename).toLowerCase();
        let contentType = 'application/octet-stream';
        if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.png') contentType = 'image/png';
        else if (ext === '.webp') contentType = 'image/webp';
        else if (ext === '.pdf') contentType = 'application/pdf';
        else if (ext === '.svg') contentType = 'image/svg+xml';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600, must-revalidate',
            },
        });

    } catch (error) {
        console.error("[GET UPLOAD ERROR]", error);
        return new NextResponse(`Erreur serveur : ${error.message}`, { status: 500 });
    }
}