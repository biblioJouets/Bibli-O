import prisma from '@/lib/core/database';
import bcrypt from 'bcryptjs';

export const userService = {
  // Créer un utilisateur
  async create(userData) {
    const { email, password, firstName, lastName, ...rest } = userData;

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    return await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        ...rest,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        city: true,
        zipCode: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Exclure le password
      },
    });
  },

  // Récupérer tous les utilisateurs
  async getAll() {
    return await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  // Récupérer un utilisateur par ID
  async getById(id) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        city: true,
        zipCode: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  // Récupérer un utilisateur par email
  async getByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
    });
  },

  // Mettre à jour un utilisateur
  async update(id, userData) {
    const { password, ...rest } = userData;
    const data = { ...rest };

    // Si le mot de passe est modifié
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    return await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        city: true,
        zipCode: true,
        role: true,
        updatedAt: true,
      },
    });
  },

  // Supprimer un utilisateur
  async delete(id) {
    return await prisma.user.delete({
      where: { id },
    });
  },

  // Vérifier le mot de passe
  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },
};
