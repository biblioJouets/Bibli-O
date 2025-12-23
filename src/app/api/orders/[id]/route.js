import { NextResponse } from 'next/server';
import { getUserOrders } from '@/lib/modules/orders/order.service';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/orders/user/[id]
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "ID utilisateur invalide" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session || parseInt(session.user.id) !== userId) {
       return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const orders = await getUserOrders(userId);
    
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Erreur API User Orders:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}