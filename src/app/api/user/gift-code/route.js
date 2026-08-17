import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/core/database";
import { z } from "zod";

// Bouclier de validation Zod
const giftCodeSchema = z.object({
  code: z.string().min(1, "Le code est requis").trim(),
});

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non connecté" }, { status: 401 });
    }

    const body = await req.json();
    
    // 1. Validation stricte du payload
    const parsedData = giftCodeSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json({ error: "Format de code invalide." }, { status: 400 });
    }

    const { code } = parsedData.data;

    // 2. Vérifier si le code existe et n'est pas utilisé
    const giftCode = await prisma.giftCode.findFirst({
      where: { code: code, isUsed: false }
    });

    if (!giftCode) {
      return NextResponse.json({ error: "Code invalide ou déjà utilisé." }, { status: 404 });
    }

    const userIdInt = parseInt(session.user.id, 10);

    // 3. Gestion des unités
    // Si ta base stocke les cartes cadeaux en euros (ex: 30), on multiplie par 100 pour la cagnotte en centimes.
    const amountToAddInCents = giftCode.amount * 100; 

    // 4. Transaction sécurisée : on crédite le compte ET on désactive le code simultanément
    await prisma.$transaction([
      prisma.users.update({
        where: { id: userIdInt },
        data: { 
          giftCredit: { increment: amountToAddInCents } 
        }
      }),
      prisma.giftCode.update({
        where: { id: giftCode.id },
        data: { 
          isUsed: true, 
          usedBy: userIdInt, 
          usedAt: new Date() 
        }
      })
    ]);

    return NextResponse.json({ success: true, message: "Cagnotte créditée avec succès !" });

  } catch (error) {
    console.error("Erreur GiftCode:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}