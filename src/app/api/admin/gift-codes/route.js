import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { randomBytes } from "crypto";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/core/database";

function generateCode() {
  const part = () => randomBytes(3).toString("hex").toUpperCase().slice(0, 4);
  return `BJ-${part()}-${part()}`;
}

const generateSchema = z.object({
  amount: z.number().positive("Le montant doit être positif.").max(500),
  count: z.number().int().min(1).max(50).default(1),
});

// GET /api/admin/gift-codes — liste tous les codes
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const codes = await prisma.giftCode.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  return NextResponse.json({ codes });
}

// POST /api/admin/gift-codes — génère un ou plusieurs codes
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validation = generateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { amount, count } = validation.data;
    const created = [];

    for (let i = 0; i < count; i++) {
      let code;
      let attempts = 0;
      do {
        code = generateCode();
        attempts++;
        if (attempts > 10) throw new Error("Impossible de générer un code unique.");
      } while (await prisma.giftCode.findUnique({ where: { code } }));

      const giftCode = await prisma.giftCode.create({ data: { code, amount } });
      created.push(giftCode);
    }

    return NextResponse.json({ success: true, codes: created }, { status: 201 });
  } catch (error) {
    console.error("[admin/gift-codes] Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
