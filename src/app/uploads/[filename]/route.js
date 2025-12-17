import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
    const { filename } = params;

    // --- DIAGNOSTIC DU CHEMIN ---
    // On affiche dans la console du serveur où il croit être
    const cwd = process.cwd();
    const filePath = path.join(cwd, 'public/uploads', filename);
    
    console.log(`[DEBUG] Requete pour: ${filename}`);
    console.log(`[DEBUG] Dossier de travail (CWD): ${cwd}`);
    console.log(`[DEBUG] Chemin complet testé: ${filePath}`);

    try {
        if (!fs.existsSync(filePath)) {
            console.error(`[DEBUG] Fichier introuvable: ${filePath}`);
            // On renvoie un message clair au navigateur
            return new NextResponse(
                `Erreur 404: Le fichier n'existe pas sur le disque.\nChemin cherché: ${filePath}`, 
                { status: 404 }
            );
        }

        const fileBuffer = fs.readFileSync(filePath);

        // Détection simple du type mime
        const ext = path.extname(filename).toLowerCase();
        let contentType = 'application/octet-stream';
        if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.png') contentType = 'image/png';
        else if (ext === '.pdf') contentType = 'application/pdf';
        else if (ext === '.svg') contentType = 'image/svg+xml';
        else if (ext === '.webp') contentType = 'image/webp';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600, must-revalidate',
            },
        });

    } catch (error) {
        console.error("[DEBUG] CRASH:", error);
        // On renvoie l'erreur technique au navigateur pour la lire
        return new NextResponse(
            `Erreur 500 (Crash): ${error.message}\nStack: ${error.stack}`, 
            { status: 500 }
        );
    }
}