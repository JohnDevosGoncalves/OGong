import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Routes publiques (pas besoin d'auth)
const PUBLIC_ROUTES = [
  "/connexion",
  "/inscription",
  "/mot-de-passe-oublie",
  "/reinitialiser-mot-de-passe",
  "/verifier-email",
  "/cgu",
  "/confidentialite",
  "/mentions-legales",
  "/api/auth",
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/verify-email",
  "/api/auth/resend-verification",
  "/api/credits/webhook",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Fichiers statiques & assets — ne pas intercepter
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/icons") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js" ||
    pathname === "/offline.html" ||
    pathname.match(/\.(?:svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return NextResponse.next();
  }

  // Pages d'inscription publique aux événements (/[id]/inscription)
  if (pathname.match(/^\/[^/]+\/inscription$/)) {
    return NextResponse.next();
  }

  // Pages de tours publiques (/[id]/tours)
  if (pathname.match(/^\/[^/]+\/tours$/)) {
    return NextResponse.next();
  }

  // API publique d'inscription (/api/inscription/[id])
  if (pathname.startsWith("/api/inscription/")) {
    return NextResponse.next();
  }

  // Routes publiques
  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  if (isPublic) return NextResponse.next();

  // Vérifier le token JWT (sans Prisma, sans Edge issues)
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  // Si pas authentifié → rediriger vers connexion
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/connexion";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Si authentifié et sur une page d'auth → rediriger vers dashboard
  if (pathname === "/connexion" || pathname === "/inscription") {
    const url = req.nextUrl.clone();
    url.pathname = "/evenements";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protéger tout sauf les fichiers statiques
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
