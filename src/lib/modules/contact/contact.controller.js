import { NextResponse } from "next/server";
import { contactService } from "./contact.service";
import { z } from "zod";
import { verifyHCaptcha } from "@/lib/core/security/verifyCaptcha";

// Schéma Zod identique au front
const contactSchema = z.object({
  name: z.string().min(2).max(50).regex(/^[a-zA-ZÀ-ÿ\s-]+$/),
  surname: z.string().min(2).max(50).regex(/^[a-zA-ZÀ-ÿ\s-]+$/),
  phone: z.string().regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/),
  email: z.string().email(),
  message: z.string().min(10).max(1000),
});

export const contactController = {
  async sendMessage(request) {
    try {
      const body = await request.json();
      const { hcaptchaToken } = body;

      // Vérification présence du token
      if (!hcaptchaToken) {
        return NextResponse.json(
          {
            success: false,
            message: "Captcha manquant.",
          },
          { status: 400 }
        );
      }

      // Vérification du captcha
      const isValidCaptcha = await verifyHCaptcha(hcaptchaToken);

      if (!isValidCaptcha) {
        return NextResponse.json(
          {
            success: false,
            message: "Captcha invalide — suspicion de robot.",
          },
          { status: 403 }
        );
      }

      // Validation Zod du formulaire
      const validated = contactSchema.parse(body);

      // Normalisation
      const sanitized = {
        name: validated.name.trim(),
        surname: validated.surname.trim(),
        phone: validated.phone.trim(),
        email: validated.email.trim().toLowerCase(),
        message: validated.message.trim(),
      };

      // Enregistrement + envoi email via Mailjet
      const contact = await contactService.send(sanitized);

      return NextResponse.json(
        {
          success: true,
          message: "Message envoyé avec succès.",
          data: contact,
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

      console.error("Erreur contactController.sendMessage:", error);
      return NextResponse.json(
        { success: false, message: "Erreur serveur" },
        { status: 500 }
      );
    }
  },
};
