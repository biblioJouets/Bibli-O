import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request) {
  const response = NextResponse.next();
  const origin = request.headers.get("origin");
  const path = request.nextUrl.pathname;


  if (
    path.startsWith("/uploads") || 
    path.startsWith("/_next") || 
    path.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // --- 1. GESTION CORS ---
  const allowedOrigins = [
    "https://www.bibliojouets.fr",
    "https://bibliojouets.fr",
    "https://bibliojouets.com",
    "https://www.bibliojouets.com",
  ];

  // Autoriser localhost en développement
  if (process.env.NODE_ENV === "development") {
    allowedOrigins.push("http://localhost:3000");
    allowedOrigins.push("http://127.0.0.1:3000");
  }

  // Définir CORS si l'origine est autorisée
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  response.headers.set("Access-Control-Max-Age", "86400");

  // Gérer les requêtes preflight OPTIONS
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: response.headers });
  }

  // --- 2. SÉCURITÉ & AUTHENTIFICATION ---
  // On récupère le token MAINTENANT (avant de faire les vérifications)
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // PROTECTION UPLOAD : Seul l'Admin peut uploader
  if (path.startsWith("/api/upload")) {
      if (token?.role !== "ADMIN") {
         return NextResponse.json({ message: "Non autorisé - Admin requis" }, { status: 401 });
      }
      // Si c'est un admin, on laisse passer vers la route d'upload
      return response; 
  }

  const isAdminRoute = path.startsWith("/admin");
  const isUserRoute = path.startsWith("/mon-compte") || path.startsWith("/panier");

  // Cas A : Non connecté essayant d'accéder à une page privée
  if ((isAdminRoute || isUserRoute) && !token) {
    const url = new URL("/connexion", request.url);
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  // Cas B : Connecté mais pas Admin essayant d'accéder à /admin
  if (isAdminRoute && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

// Configuration du matcher (Routes surveillées)
export const config = {
  matcher: [
    // IMPORTANT : J'ai retiré 'api/upload' de la liste d'exclusion ci-dessous
    // Sinon le middleware ne s'active jamais pour l'upload !
    '/((?!_next/static|_next/image|favicon.ico|uploads).*)',
  ],
};