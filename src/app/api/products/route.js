import { productController } from '@/lib/modules/products/product.controller';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET(request) {
    return productController.getAll(request);
}

export async function POST(request) {
    //Rôle admin peut créer les produits
    const session = await getServerSession(authOptions);
    if(session?.user?.role !=='ADMIN') {
        return NextResponse.json({ error: "Unauthorized"}, { status: 401});
    }
    return productController.create(request);
}