import { newsletterService } from './newsletter.service';
import { NextResponse } from 'next/server';

// Validation email RFC 5322 simplifiée mais robuste
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254; // RFC 5321

export const newsletterController = {
  // POST /api/newsletter - S'inscrire
  async subscribe(request) {
    try {
      const { email } = await request.json();

      // Validation email
      if (!email || typeof email !== 'string') {
        return NextResponse.json(
          { success: false, message: 'Email requis et doit être une chaîne' },
          { status: 400 }
        );
      }

      const trimmedEmail = email.trim().toLowerCase();

      // Vérifier format et longueur
      if (!EMAIL_REGEX.test(trimmedEmail) || trimmedEmail.length > MAX_EMAIL_LENGTH) {
        return NextResponse.json(
          { success: false, message: 'Email invalide' },
          { status: 400 }
        );
      }

      const newsletter = await newsletterService.subscribe(trimmedEmail);

      return NextResponse.json(
        {
          success: true,
          message: 'Inscription réussie !',
          data: newsletter,
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('Erreur dans newsletterController.subscribe :', error.message);
      
      if (error.message.includes('déjà inscrit')) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { success: false, message: 'Erreur serveur' },
        { status: 500 }
      );
    }
  },

  // GET /api/newsletter - Récupérer tous les abonnés
  async getAll(request) {
    try {
      const newsletters = await newsletterService.getAll();
      const count = await newsletterService.count();

      return NextResponse.json({
        success: true,
        data: newsletters,
        count,
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Erreur serveur' },
        { status: 500 }
      );
    }
  },

  // DELETE /api/newsletter?email=xxx - Se désinscrire
  async unsubscribe(request) {
    try {
      const { searchParams } = new URL(request.url);
      const email = searchParams.get('email');

      if (!email) {
        return NextResponse.json(
          { success: false, message: 'Email requis' },
          { status: 400 }
        );
      }

      const trimmedEmail = email.trim().toLowerCase();

      if (!EMAIL_REGEX.test(trimmedEmail) || trimmedEmail.length > MAX_EMAIL_LENGTH) {
        return NextResponse.json(
          { success: false, message: 'Email invalide' },
          { status: 400 }
        );
      }

      await newsletterService.unsubscribe(trimmedEmail);

      return NextResponse.json({
        success: true,
        message: 'Désinscription réussie',
      });
    } catch (error) {
      console.error('Erreur dans unsubscribe :', error.message);
      return NextResponse.json(
        { success: false, message: 'Erreur serveur' },
        { status: 500 }
      );
    }
  },
};