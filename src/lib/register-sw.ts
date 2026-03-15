/**
 * Enregistre le service worker pour le support PWA.
 * Ne fait rien côté serveur ou si le navigateur ne supporte pas les SW.
 */
export function registerServiceWorker(): void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => console.log("SW enregistré :", reg.scope))
      .catch((err) => console.error("Échec enregistrement SW :", err));
  });
}
