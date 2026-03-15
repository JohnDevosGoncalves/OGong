"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/register-sw";

/**
 * Composant client qui enregistre le service worker au montage.
 * Ne rend aucun élément visible.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null;
}
