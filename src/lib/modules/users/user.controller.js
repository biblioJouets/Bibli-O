import { userService } from './user.service';
import { NextResponse } from 'next/server';

export const userController = {
  // POST /api/users - Créer un utilisateur
  async create(request) {
    try {
      const userData = await request.json();

      // Validation basique
      const { email, password, firstName, lastName } = userData;
      if (!email || !password || !firstName || !lastName) {
        return NextResponse.json(
          { success: false, message: 'Champs obligatoires manquants' },
          { status: 400 }
        );
      }

      const user = await userService.create(userData);

      return NextResponse.json(
        {
          success: true,
          message: 'Utilisateur créé avec succès',
          data: user,
        },
        { status: 201 }
      );
    } catch (error) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { success: false, message: 'Cet email est déjà utilisé' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { success: false, message: 'Erreur serveur' },
        { status: 500 }
      );
    }
  },

  // GET /api/users - Récupérer tous les utilisateurs
  async getAll(request) {
    try {
      const users = await userService.getAll();

      return NextResponse.json({
        success: true,
        data: users,
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Erreur serveur' },
        { status: 500 }
      );
    }
  },

  // GET /api/users/[id] - Récupérer un utilisateur
  async getById(request, { params }) {
    try {
      const { id } = params;
      const user = await userService.getById(id);

      if (!user) {
        return NextResponse.json(
          { success: false, message: 'Utilisateur non trouvé' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: user,
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Erreur serveur' },
        { status: 500 }
      );
    }
  },

  // PUT /api/users/[id] - Mettre à jour un utilisateur
  async update(request, { params }) {
    try {
      const { id } = params;
      const userData = await request.json();

      const user = await userService.update(id, userData);

      return NextResponse.json({
        success: true,
        message: 'Utilisateur mis à jour',
        data: user,
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Erreur serveur' },
        { status: 500 }
      );
    }
  },

  // DELETE /api/users/[id] - Supprimer un utilisateur
  async delete(request, { params }) {
    try {
      const { id } = params;
      await userService.delete(id);

      return NextResponse.json({
        success: true,
        message: 'Utilisateur supprimé',
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Erreur serveur' },
        { status: 500 }
      );
    }
  },
};