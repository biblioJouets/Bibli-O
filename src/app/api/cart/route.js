// src/app/api/cart/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { cartService } from "@/lib/modules/cart/cart.service";
import prisma from "@/lib/core/database";

// Middleware interne pour récupérer l'ID User
async function getUserId() {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  return parseInt(session.user.id);
}

// GET : Récupérer le panier
export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ items: [] }); // Panier vide si non connecté

  try {
    const cart = await cartService.getCart(userId);
    return NextResponse.json(cart);
  } catch (error) {
    return NextResponse.json({ error: "Erreur panier" }, { status: 500 });
  }
}

// POST : Ajouter au panier
export async function POST(request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  try {
    const { productId, quantity, intent } = await request.json();
    await cartService.addToCart(userId, productId, quantity, intent || "RENTAL");

    const cart = await cartService.getCart(userId);
    return NextResponse.json(cart);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message || "Erreur ajout" }, { status: 400 });
  }
  
}

export async function PUT(request) {
  try {
    // 1. Vérification de l'utilisateur
    const userId = await getUserId(); 
    if (!userId) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

    // 2. Extraction des données envoyées par le frontend
    const body = await request.json();
    const { action, productId, intent } = body;

    // 3. Traitement de l'action "updateIntent"
    if (action === 'updateIntent') {
      
      // On cherche d'abord le panier de cet utilisateur
      const userCart = await prisma.cart.findUnique({
        where: { userId: userId }
      });

      if (!userCart) {
        return NextResponse.json({ error: "Panier introuvable" }, { status: 404 });
      }

      // On met à jour l'intention (RENTAL ou PURCHASE) pour ce produit spécifique
      await prisma.cartItem.updateMany({
        where: { 
          cartId: userCart.id,
          productId: parseInt(productId)
        },
        data: { 
          intent: intent 
        }
      });

      return NextResponse.json({ message: "Intention mise à jour avec succès" }, { status: 200 });
    }

    return NextResponse.json({ error: "Action non reconnue" }, { status: 400 });

  } catch (error) {
    console.error("Erreur PUT /api/cart :", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

// DELETE : Supprimer un item
export async function DELETE(request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");
    
    await cartService.removeItem(userId, itemId);
    
    const cart = await cartService.getCart(userId);
    return NextResponse.json(cart);
  } catch (error) {
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 });
  }
}