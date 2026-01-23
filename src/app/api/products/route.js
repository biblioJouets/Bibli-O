import { NextResponse } from "next/server";
import { productService } from '@/lib/modules/products/product.service'; // On appelle le service directement
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// --- GET : Public (Tout le monde peut voir le catalogue) ---
export async function GET(request) {
    try {
        const products = await productService.getAll();
        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: "Erreur chargement produits" }, { status: 500 });
    }
}

// --- POST : Création (ADMIN UNIQUEMENT) ---
export async function POST(request) {
    try {
        // 1. Sécurité
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 401 });
        }

        // 2. Traitement
        const body = await request.json();
        
        // Validation basique (optionnel si géré dans le service, mais mieux ici)
        if (!body.name || !body.price) {
             return NextResponse.json({ error: "Nom et Prix obligatoires" }, { status: 400 });
        }

        const newProduct = await productService.create(body);
        return NextResponse.json(newProduct, { status: 201 });

    } catch (error) {
        console.error("Erreur Création Produit:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}