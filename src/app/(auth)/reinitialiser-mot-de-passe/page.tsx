"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input } from "@/components/ui";

export default function ReinitialiserMotDePassePage() {
  return (
    <Suspense fallback={<div className="max-w-sm w-full text-center text-muted text-sm">Chargement...</div>}>
      <ReinitialiserMotDePasseForm />
    </Suspense>
  );
}

function ReinitialiserMotDePasseForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    // Client-side validation
    const errors: Record<string, string> = {};
    if (newPassword.length < 8) {
      errors.newPassword = "Le mot de passe doit faire au moins 8 caractères";
    }
    if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Les mots de passe ne correspondent pas";
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/connexion"), 3000);
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="max-w-sm w-full text-center">
        <div className="w-14 h-14 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Lien invalide</h1>
        <p className="text-muted text-sm mb-6">
          Ce lien de réinitialisation est invalide ou a expiré.
        </p>
        <Link
          href="/mot-de-passe-oublie"
          className="inline-block py-2.5 px-5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors"
        >
          Faire une nouvelle demande
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-sm w-full text-center">
        <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Mot de passe réinitialisé !</h1>
        <p className="text-muted text-sm mb-6">
          Votre mot de passe a été modifié avec succès. Vous allez être redirigé vers la page de connexion.
        </p>
        <Link
          href="/connexion"
          className="inline-block py-2.5 px-5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-sm w-full">
      <h1 className="text-2xl font-bold text-foreground mb-2">
        Nouveau mot de passe
      </h1>
      <p className="text-muted text-sm mb-8">
        Choisissez un nouveau mot de passe pour votre compte.
      </p>

      {error && (
        <div className="mb-5 p-3 rounded-lg bg-danger/10 text-danger text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Nouveau mot de passe"
          type="password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Minimum 8 caractères"
          error={fieldErrors.newPassword}
        />

        <Input
          label="Confirmer le mot de passe"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Retapez le mot de passe"
          error={fieldErrors.confirmPassword}
        />

        <Button type="submit" loading={loading} className="w-full">
          Réinitialiser le mot de passe
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/connexion" className="text-primary font-medium hover:text-primary-hover transition-colors">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
