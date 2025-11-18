import { newsletterService } from './newsletter.service';
import { NextResponse } from 'next/server';

export const newsletterController = {
  // POST /api/newsletter - S'inscrire
  async subscribe(request) {
    try {
      const { email } = await request.json();

      // Validation
      if (!email || !email.includes('@')) {
        return NextResponse.json(
          { success: false, message: 'Email invalide' },
          { status: 400 }
        );
      }

      const newsletter = await newsletterService.subscribe(email);

      return NextResponse.json(
        {
          success: true,
          message: 'Inscription réussie !',
          data: newsletter,
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('Erreur dans newsletterController.subscribe :', error);
      console.error('Stack trace :', error.stack);
      if (error.message.includes('déjà inscrit')) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { success: false, message: 'Erreur serveur',
          error: error.message,
    
         },
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

      await newsletterService.unsubscribe(email);

      return NextResponse.json({
        success: true,
        message: 'Désinscription réussie',
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Erreur serveur' },
        { status: 500 }
      );
    }
  },
};