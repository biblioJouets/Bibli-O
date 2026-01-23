// src/app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/core/database";
import { compare } from "bcryptjs";
import { checkRateLimit } from '@/lib/core/security/rateLimit';


const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith("https");

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials, req) {
        const identifier = credentials?.email || 'unknown';
        const rateLimit = checkRateLimit(identifier, 5);

        if (!rateLimit.allowed) {
         throw new Error("Trop de tentatives. Réessayez dans 1 minute.");
      }
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.users.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          return null;
        }

        const isValid = await compare(credentials.password, user.password);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id.toString(),
          name: user.firstName,
          email: user.email,
          role: user.role,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  // --- CORRECTION CRITIQUE POUR DOCKER LOCAL ---
  // On force la configuration des cookies pour s'adapter au HTTP local
  cookies: {
    sessionToken: {
      name: useSecureCookies ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies, // false en local (http), true en prod (https)
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
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