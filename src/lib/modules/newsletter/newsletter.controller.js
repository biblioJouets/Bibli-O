import { NextResponse } from 'next/server';
import { newsletterService } from './newsletter.service';
import { z } from 'zod';

// Schéma Zod : email stricte
const newsletterSchema = z.object({
  email: z.string().email().max(254)
});

export const newsletterController = {
  // POST /api/newsletter
  async subscribe(request) {
    try {
      const body = await request.json();

      // Validation Zod
      const { email } = newsletterSchema.parse(body);
      const normalizedEmail = email.trim().toLowerCase();

      const newsletter = await newsletterService.subscribe(normalizedEmail);

      return NextResponse.json(
        {
          success: true,
          message: 'Inscription réussie !',
          data: newsletter
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

      if (error.message.includes('déjà inscrit')) {
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

  // GET /api/newsletter
  async getAll() {
    try {
      const newsletters = await newsletterService.getAll();
      const count = await newsletterService.count();

      return NextResponse.json({
        success: true,
        data: newsletters,
        count
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "Erreur serveur" },
        { status: 500 }
      );
    }
  },

  // DELETE /api/newsletter?email=xxx
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

      // Validation Zod
      const { email: validatedEmail } = newsletterSchema.parse({ email });
      const normalizedEmail = validatedEmail.trim().toLowerCase();

      await newsletterService.unsubscribe(normalizedEmail);

      return NextResponse.json({
        success: true,
        message: "Désinscription réussie"
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
  }
};
