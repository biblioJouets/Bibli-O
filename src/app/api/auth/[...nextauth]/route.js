// src/app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/core/database";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // 1. Chercher l'utilisateur dans la DB
        // Attention : on utilise 'users' (pluriel) car c'est défini ainsi dans ton schema.prisma
        const user = await prisma.users.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          return null;
        }

        // 2. Vérifier le mot de passe
        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          return null;
        }

        // 3. Retourner l'utilisateur pour le token (sans le mdp)
        return {
          id: user.id.toString(), // Convertir en string pour le JWT
          name: user.firstName,   // On utilise le prénom pour l'affichage
          email: user.email,
          role: user.role,        // On passe le rôle (USER ou ADMIN)
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // Ajouter les infos personnalisées au JWT
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    // Rendre les infos disponibles dans la session (côté client)
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/connexion', 
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };