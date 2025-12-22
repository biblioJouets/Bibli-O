import prisma from '@/lib/core/database';
import bcrypt from 'bcryptjs';


export const userService = {
  // Créer un utilisateur
  async create(userData) {
    const { 
      email, password, firstName, lastName, phone, address, ...rest 
    } = userData;

    const hashedPassword = await bcrypt.hash(password, 10);

    const createData = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role: 'USER', // Sécurité : on force le rôle USER à l'inscription
      ...rest,
    };

    if (address && address.street) {
      createData.Addresses = {
        create: {
          name: address.name || "Domicile",
          street: address.street,
          zipCode: address.zipCode,
          city: address.city,
          country: address.country || "France"
        }
      };
    }

    return await prisma.users.create({ 
      data: createData,
      select: {
        id: true, email: true, firstName: true, lastName: true, role: true, Addresses: true,
      },
    });
  },

  // Récupérer tous les utilisateurs
  async getAll() {
    return await prisma.users.findMany({
      select: {
        id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  // Récupérer un utilisateur par ID
  async getById(id) {
    return await prisma.users.findUnique({
      where: { id: parseInt(id) }, // Assurez-vous que l'ID est un entier
      select: {
        id: true, email: true, firstName: true, lastName: true, phone: true,
        role: true, createdAt: true, updatedAt: true,
        Addresses: true, 
      },
    });
  },

  // Récupérer un utilisateur par email
  async getByEmail(email) {
    // CORRECTION ICI : prisma.users
    return await prisma.users.findUnique({
      where: { email },
    });
  },

  // Mettre à jour
  async update(id, userData) {
    const { password, ...rest } = userData;
    const data = { ...rest };

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    // CORRECTION ICI : prisma.users
    return await prisma.users.update({
      where: { id: parseInt(id) },
      data,
      select: {
        id: true, email: true, firstName: true, lastName: true, role: true, updatedAt: true,
      },
    });
  },

  // Supprimer
  async delete(id) {
    // CORRECTION ICI : prisma.users
    return await prisma.users.delete({
      where: { id: parseInt(id) },
    });
  },

  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
  
};

export const updateUser = async (id, data) => {
  const dataToUpdate = {};
if (data.firstName) dataToUpdate.firstName = data.firstName;
  if (data.lastName) dataToUpdate.lastName = data.lastName;
  if (data.phone) dataToUpdate.phone = data.phone;
  if (data.email) dataToUpdate.email = data.email;
  try {
    return await prisma.users.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
    });
  } catch (error) {
    console.error("Erreur Prisma updateUser:", error);
    throw error;
  }

};