"use client";

import { useEffect, useState, useCallback } from "react";

const DISMISSED_KEY = "ogong-install-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Bannière d'installation PWA.
 * S'affiche uniquement sur mobile/tablette lorsque le navigateur
 * propose l'installation et que l'utilisateur ne l'a pas refusée.
 */
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Ne pas afficher si déjà refusé
    if (localStorage.getItem(DISMISSED_KEY)) return;

    function handlePrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", handlePrompt);
    return () =>
      window.removeEventListener("beforeinstallprompt", handlePrompt);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    setDeferredPrompt(null);
    localStorage.setItem(DISMISSED_KEY, "1");
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-fade-in-up rounded-xl border border-border bg-surface p-4 shadow-lg">
      <p className="mb-3 text-sm font-medium text-foreground">
        Installer OGong sur votre appareil
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleInstall}
          className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          Installer
        </button>
        <button
          onClick={handleDismiss}
          className="rounded-lg px-4 py-2 text-sm text-muted transition-colors hover:bg-surface-hover"
        >
          Plus tard
        </button>
      </div>
    </div>
  );
}
