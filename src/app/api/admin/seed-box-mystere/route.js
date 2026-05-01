// src/app/api/admin/seed-box-mystere/route.js
// Route one-shot ADMIN pour injecter le produit fantôme "Box Mystère de Mai"
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/core/database";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const product = await prisma.products.upsert({
    where: { reference: "BOX-MYSTERE" },
    update: {
      name: "Box Mystère de Mai",
      price: 24.90,
      stock: 100,
    },
    create: {
      reference: "BOX-MYSTERE",
      name: "Box Mystère de Mai",
      slug: "box-mystere-de-mai",
      description: "4 jouets surprises sélectionnés par notre équipe selon l'âge et le sexe de votre enfant.",
      price: 24.90,
      stock: 100,
      images: [],
      highlights: [],
      condition: "NEW",
    },
  });

  return NextResponse.json({ success: true, product });
}
