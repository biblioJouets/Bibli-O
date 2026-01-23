import { NextResponse } from "next/server";
import { productService } from '@/lib/modules/products/product.service';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// --- GET : Public (Détail d'un produit) ---
export async function GET(request, { params }) {
  try {
    // FIX NEXT.JS 16
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    const product = await productService.getById(id);

    if (!product) {
      return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// --- PUT : Modification (ADMIN UNIQUEMENT) ---
export async function PUT(request, { params }) {
  try {
    // 1. FIX NEXT.JS 16
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    // 2. Sécurité
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Traitement
    const body = await request.json();
    const updatedProduct = await productService.update(id, body);

    return NextResponse.json(updatedProduct);

  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: "Erreur mise à jour" }, { status: 500 });
  }
}

// --- DELETE : Suppression (ADMIN UNIQUEMENT) ---
export async function DELETE(request, { params }) {
  try {
    // 1. FIX NEXT.JS 16
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    // 2. Sécurité
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Traitement
    await productService.delete(id);
    return NextResponse.json({ success: true, message: "Produit supprimé" });

  } catch (error) {
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 });
  }
}