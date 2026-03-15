// OGong Service Worker
// Fournit le support hors ligne et la mise en cache des ressources statiques.

const CACHE_VERSION = "ogong-v1";

// Ressources à mettre en cache lors de l'installation (app shell)
const APP_SHELL = [
  "/",
  "/connexion",
  "/evenements",
  "/offline.html",
];

// --- Installation ---
// Met en cache les ressources essentielles de l'app shell.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// --- Activation ---
// Supprime les anciens caches pour libérer de l'espace.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_VERSION)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// --- Fetch ---
// Stratégie cache-first pour les ressources statiques,
// network-first pour les appels API et les pages.
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== "GET") return;

  // Ignorer les requêtes vers d'autres origines (analytics, etc.)
  if (url.origin !== location.origin) return;

  // Stratégie network-first pour les appels API
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Stratégie cache-first pour les ressources statiques
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Network-first pour les pages HTML (navigation)
  event.respondWith(networkFirst(request));
});

/**
 * Vérifie si le chemin correspond à une ressource statique.
 */
function isStaticAsset(pathname) {
  return /\.(css|js|woff2?|ttf|eot|svg|png|jpe?g|gif|webp|ico)$/.test(pathname);
}

/**
 * Stratégie cache-first : retourne la version en cache si disponible,
 * sinon effectue une requête réseau et met en cache le résultat.
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("", { status: 408 });
  }
}

/**
 * Stratégie network-first : tente une requête réseau, puis retourne
 * la version en cache en cas d'échec. Affiche la page hors ligne
 * pour les requêtes de navigation.
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Afficher la page hors ligne pour les requêtes de navigation
    if (request.mode === "navigate") {
      return caches.match("/offline.html");
    }

    return new Response("", { status: 408 });
  }
}
