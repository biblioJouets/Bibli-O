import { NextResponse } from "next/server";
import { contactService } from "./contact.service";
import { z } from "zod";
import { verifyHCaptcha } from "@/lib/core/security/verifyCaptcha";
import { checkRateLimit, getRateLimitKey } from "@/lib/core/security/rateLimit";

const contactSchema = z.object({
  name: z.string().min(2).max(50).regex(/^[a-zA-ZÀ-ÿ\s-]+$/),
  surname: z.string().min(2).max(50).regex(/^[a-zA-ZÀ-ÿ\s-]+$/),
  phone: z.string().regex(/^(?:(?:\+|00)33|0)[1-9]\d{8}$/),
  email: z.string().email(),
  message: z.string().min(10).max(1000),
});

export const contactController = {
  async create(request) {
    try {
      // 1. Rate limiting (5 messages/minute par IP)
      const ip = getRateLimitKey(request);
      const { allowed, remaining, resetIn } = checkRateLimit(`contact:${ip}`, 5);

      if (!allowed) {
        return NextResponse.json(
          { 
            success: false, 
            message: `Trop de requêtes. Réessayez dans ${Math.ceil(resetIn / 1000)} secondes.` 
          },
          { 
            status: 429,
            headers: {
              'Retry-After': String(Math.ceil(resetIn / 1000)),
              'X-RateLimit-Remaining': '0'
            }
          }
        );
      }

      const body = await request.json();
      const { hcaptchaToken } = body;

      // 2. Vérification hCaptcha
      if (!hcaptchaToken) {
        return NextResponse.json(
          { success: false, message: "Captcha manquant." },
          { status: 400 }
        );
      }

      const isValidCaptcha = await verifyHCaptcha(hcaptchaToken);
      if (!isValidCaptcha) {
        return NextResponse.json(
          { success: false, message: "Captcha invalide." },
          { status: 403 }
        );
      }

      // 3. Validation Zod
      const validated = contactSchema.parse(body);

      // 4. Normalisation
      const sanitized = {
        name: validated.name.trim(),
        surname: validated.surname.trim(),
        phone: validated.phone.trim(),
        email: validated.email.trim().toLowerCase(),
        message: validated.message.trim(),
      };

      // 5. Création du message
      const contact = await contactService.createMessage(sanitized);

      return NextResponse.json(
        { success: true, message: "Message envoyé avec succès.", data: { id: contact.id } },
        { 
          status: 201,
          headers: { 'X-RateLimit-Remaining': String(remaining) }
        }
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, errors: error.errors },
          { status: 400 }
        );
      }

      console.error("Erreur contactController.create:", error);
      return NextResponse.json(
        { success: false, message: "Erreur serveur" },
        { status: 500 }
      );
    }
  },
};