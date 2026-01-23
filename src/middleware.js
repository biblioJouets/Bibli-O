import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request) {
  const response = NextResponse.next();
  const path = request.nextUrl.pathname;

  // 1. GESTION DES FICHIERS STATIQUES & NEXT (On laisse passer)
  if (
    path.startsWith("/_next") || 
    path.startsWith("/favicon.ico") ||
    path.startsWith("/assets") // Vos images publiques
  ) {
    return NextResponse.next();
  }

  // 2. SÉCURITÉ CORS (Conservation de votre config)
  const origin = request.headers.get("origin");
  const allowedOrigins = [
    "https://www.bibliojouets.fr",
    "https://bibliojouets.fr",
    "https://bibliojouets.com",
    "https://www.bibliojouets.com",
  ];
  if (process.env.NODE_ENV === "development") {
    allowedOrigins.push("http://localhost:3000");
  }

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: response.headers });
  }

  // 3. AUTHENTIFICATION
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // --- PROTECTION STRICTE DES UPLOADS ---
  // Seul l'admin peut uploader. La lecture reste publique pour les images (compromis acceptable pour l'instant)
  if (path.startsWith("/api/upload") && token?.role !== "ADMIN") {
     return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  // --- PROTECTION DES ROUTES ADMIN (Pages & API) ---
  // On protège /admin (front) ET /api/orders, /api/products en écriture, etc.
  const isAdminRoute = path.startsWith("/admin");
  const isAdminApi = path.startsWith("/api/admin") || // Si vous avez des routes api/admin
                     (path.startsWith("/api/orders") && request.method === "GET" && !path.includes("/user/")) || // Lister toutes les commandes
                     (path.startsWith("/api/products") && ["POST", "PUT", "DELETE"].includes(request.method)); // Modifier les produits

  if ((isAdminRoute || isAdminApi) && token?.role !== "ADMIN") {
    if (path.startsWith("/api/")) {
        return NextResponse.json({ error: "Accès refusé : Admin requis" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // --- PROTECTION ROUTES UTILISATEUR ---
  const isUserRoute = path.startsWith("/mon-compte") || path.startsWith("/panier");
  if (isUserRoute && !token) {
    const url = new URL("/connexion", request.url);
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};