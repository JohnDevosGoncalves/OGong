"use client";

import { Suspense } from "react";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type Status = "loading" | "success" | "error" | "expired";

function VerifierEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const verifyEmail = useCallback(async (verificationToken: string) => {
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message);
        // Redirection vers connexion après 3 secondes
        setTimeout(() => router.push("/connexion"), 3000);
      } else if (res.status === 410) {
        setStatus("expired");
        setMessage(data.error);
      } else {
        setStatus("error");
        setMessage(data.error);
      }
    } catch {
      setStatus("error");
      setMessage("Une erreur est survenue lors de la vérification.");
    }
  }, [router]);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Jeton de vérification manquant.");
      return;
    }

    verifyEmail(token);
  }, [token, verifyEmail]);

  async function handleResend() {
    if (!email) return;

    setResendLoading(true);
    setResendMessage("");

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setResendMessage(data.message || data.error);
    } catch {
      setResendMessage("Une erreur est survenue.");
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div className="max-w-sm w-full text-center">
      {status === "loading" && (
        <>
          <div className="mx-auto mb-6 w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Vérification en cours
          </h1>
          <p className="text-muted text-sm">
            Veuillez patienter pendant que nous vérifions votre adresse email...
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-success/10 flex items-center justify-center animate-[scale-in_0.3s_ease-out]">
            <svg
              className="w-8 h-8 text-success"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Email vérifié !
          </h1>
          <p className="text-muted text-sm mb-4">{message}</p>
          <p className="text-muted text-xs">
            Redirection vers la page de connexion...
          </p>
        </>
      )}

      {(status === "error" || status === "expired") && (
        <>
          <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-danger"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {status === "expired" ? "Lien expiré" : "Erreur de vérification"}
          </h1>
          <p className="text-muted text-sm mb-6">{message}</p>

          {status === "expired" && (
            <div className="space-y-3">
              <p className="text-sm text-foreground font-medium">
                Renvoyer un email de vérification
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.fr"
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
              <button
                onClick={handleResend}
                disabled={resendLoading || !email}
                className="w-full py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-medium text-sm transition-colors"
              >
                {resendLoading ? "Envoi en cours..." : "Renvoyer un email"}
              </button>
              {resendMessage && (
                <p className="text-sm text-muted">{resendMessage}</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function VerifierEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-sm w-full text-center">
          <div className="mx-auto mb-6 w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted text-sm">Chargement...</p>
        </div>
      }
    >
      <VerifierEmailContent />
    </Suspense>
  );
}
