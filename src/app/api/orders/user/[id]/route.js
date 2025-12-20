import { NextResponse } from 'next/server';
import { getUserOrders } from '@/lib/modules/orders/order.service';

// GET /api/orders/user/[id]
export async function GET(request, { params }) {
  try {
    const userId = parseInt(params.id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "ID utilisateur invalide" }, { status: 400 });
    }

    // On récupère l'historique via le service
    const orders = await getUserOrders(userId);
    
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Erreur API User Orders:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}