import { productController } from '@/lib/modules/products/product.controller';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET(request, context) {
  return productController.getById(request, context);
}

export async function PUT(request, context) {
  // Sécurité Admin
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return productController.update(request, context);
}

export async function DELETE(request, context) {
  // Sécurité Admin
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return productController.delete(request, context);
}