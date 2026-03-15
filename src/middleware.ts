import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Routes publiques (pas besoin d'auth)
  const publicRoutes = [
    "/connexion",
    "/inscription",
    "/mot-de-passe-oublie",
    "/api/auth",
  ];

  // Pages d'inscription publique aux événements
  if (pathname.match(/^\/[^/]+\/inscription$/)) {
    return NextResponse.next();
  }

  // Pages de tours publiques (affichage pendant l'événement)
  if (pathname.match(/^\/[^/]+\/tours$/)) {
    return NextResponse.next();
  }

  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));
  if (isPublic) return NextResponse.next();

  // API publique d'inscription
  if (pathname.startsWith("/api/auth/register")) {
    return NextResponse.next();
  }

  // Si pas authentifié, rediriger vers connexion
  if (!req.auth) {
    const url = req.nextUrl.clone();
    url.pathname = "/connexion";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Si authentifié et sur une page d'auth, rediriger vers dashboard
  if (req.auth && (pathname === "/connexion" || pathname === "/inscription")) {
    const url = req.nextUrl.clone();
    url.pathname = "/evenements";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Protéger tout sauf les fichiers statiques et les assets
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
