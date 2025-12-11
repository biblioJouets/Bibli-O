// src/app/api/cart/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { cartService } from "@/lib/modules/cart/cart.service";

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
    const { productId, quantity } = await request.json();
    await cartService.addToCart(userId, productId, quantity);
    
    // On renvoie le panier à jour
    const cart = await cartService.getCart(userId);
    return NextResponse.json(cart);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur ajout" }, { status: 500 });
  }
}

// PUT : Modifier quantité
export async function PUT(request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  try {
    const { itemId, quantity } = await request.json();
    if (quantity < 1) {
       await cartService.removeItem(userId, itemId);
    } else {
       await cartService.updateQuantity(userId, itemId, quantity);
    }
    
    const cart = await cartService.getCart(userId);
    return NextResponse.json(cart);
  } catch (error) {
    return NextResponse.json({ error: "Erreur update" }, { status: 500 });
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