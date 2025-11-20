import { NextResponse } from "next/server";
import { newsletterService } from "./newsletter.service";
import { z } from "zod";
import { verifyHCaptcha } from "@/lib/core/security/verifyCaptcha";

// Schéma Zod : email strict
const newsletterSchema = z.object({
  email: z.string().email().max(254)
});

export const newsletterController = {
  async subscribe(request) {
    try {
      const body = await request.json();

      // extraction des champs
      const { email, hcaptchaToken } = body;

      // Vérification hCaptcha
      if (!hcaptchaToken) {
        return NextResponse.json(
          {
            success: false,
            message: "Captcha manquant",
          },
          { status: 400 }
        );
      }

      const isValidCaptcha = await verifyHCaptcha(hcaptchaToken);

      if (!isValidCaptcha) {
        return NextResponse.json(
          {
            success: false,
            message: "Captcha invalide — suspicion de robot",
          },
          { status: 403 }
        );
      }

      // Validation Zod (après captcha)
      const parsed = newsletterSchema.parse({ email });
      const normalizedEmail = parsed.email.trim().toLowerCase();

      const newsletter = await newsletterService.subscribe(normalizedEmail);

      return NextResponse.json(
        {
          success: true,
          message: "Inscription réussie !",
          data: newsletter,
        },
        { status: 201 }
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, errors: error.errors },
          { status: 400 }
        );
      }

      if (error.message.includes("déjà inscrit")) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 409 }
        );
      }

      console.error("Erreur newsletterController.subscribe:", error.message);
      return NextResponse.json(
        { success: false, message: "Erreur serveur" },
        { status: 500 }
      );
    }
  },

  async getAll() {
    try {
      const newsletters = await newsletterService.getAll();
      const count = await newsletterService.count();

      return NextResponse.json({
        success: true,
        data: newsletters,
        count,
      });
    } catch (_) {
      return NextResponse.json(
        { success: false, message: "Erreur serveur" },
        { status: 500 }
      );
    }
  },

  async unsubscribe(request) {
    try {
      const { searchParams } = new URL(request.url);
      const email = searchParams.get("email");

      if (!email) {
        return NextResponse.json(
          { success: false, message: "Email requis" },
          { status: 400 }
        );
      }

      const { email: validatedEmail } = newsletterSchema.parse({ email });
      const normalizedEmail = validatedEmail.trim().toLowerCase();

      await newsletterService.unsubscribe(normalizedEmail);

      return NextResponse.json({
        success: true,
        message: "Désinscription réussie",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, errors: error.errors },
          { status: 400 }
        );
      }

      console.error("Erreur dans unsubscribe:", error.message);
      return NextResponse.json(
        { success: false, message: "Erreur serveur" },
        { status: 500 }
      );
    }
  },
};
