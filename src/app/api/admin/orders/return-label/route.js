import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import prisma from "@/lib/core/database";
import { writeFile } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const orderId = formData.get("orderId");

    if (!file || !orderId) {
      return NextResponse.json({ error: "Fichier ou orderId manquant." }, { status: 400 });
    }

    // Vérification MIME + magic bytes PDF (%PDF-)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const isPdf = buffer.slice(0, 5).toString('ascii') === '%PDF-';
    if (!isPdf) {
      return NextResponse.json({ error: "Seuls les fichiers PDF valides sont acceptés." }, { status: 400 });
    }
    // Limite de taille : 10 Mo
    if (buffer.length > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Fichier trop volumineux (max 10 Mo)." }, { status: 400 });
    }

    const orderIdInt = parseInt(orderId);
    if (isNaN(orderIdInt)) {
      return NextResponse.json({ error: "orderId invalide." }, { status: 400 });
    }

    const order = await prisma.orders.findUnique({ where: { id: orderIdInt } });
    if (!order) {
      return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
    }

    // Nom de fichier sans données issues du body dans le path
    const filename = `return-label-${randomUUID()}.pdf`;
    const uploadDir = join(process.cwd(), "public", "uploads");
    await writeFile(join(uploadDir, filename), buffer);

    const returnLabelUrl = `/uploads/${filename}`;

    await prisma.orders.update({
      where: { id: orderIdInt },
      data: { returnLabelUrl },
    });

    return NextResponse.json({ returnLabelUrl }, { status: 200 });
  } catch (error) {
    console.error("[Admin] Erreur upload bordereau:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
