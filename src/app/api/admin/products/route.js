// src/app/api/admin/products/route.js
// Recherche de produits pour le panneau d'assignation Box Mystère (admin uniquement)
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/core/database";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search  = searchParams.get("search") || "";
  const inStock = searchParams.get("inStock") === "true";

  const products = await prisma.products.findMany({
    where: {
      ...(search && {
        name: { contains: search, mode: "insensitive" },
      }),
      ...(inStock && { stock: { gt: 0 } }),
      reference: { not: "BOX-MYSTERE" },
      condition: { notIn: ["RETIRED", "REPAIRING", "DAMAGED"] },
    },
    select: { id: true, name: true, reference: true, stock: true, ageRange: true, images: true },
    orderBy: { name: "asc" },
    take: 30,
  });

  return NextResponse.json({ products });
}
