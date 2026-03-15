"use client";

import { useState } from "react";
import Link from "next/link";

export default function InscriptionPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const passwordConfirm = formData.get("password-confirm") as string;

    if (password !== passwordConfirm) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nom: formData.get("nom"),
        prenom: formData.get("prenom"),
        email: formData.get("email"),
        telephone: formData.get("telephone"),
        password,
      }),
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="max-w-sm w-full text-center">
        <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-success"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Vérifiez votre boîte mail
        </h1>
        <p className="text-muted text-sm mb-4">
          Un email de confirmation a été envoyé à votre adresse.
          Cliquez sur le lien pour activer votre compte.
        </p>
        <div className="p-3 rounded-lg bg-primary/10 text-primary text-sm font-medium mb-6">
          Vous avez reçu 5 crédits de bienvenue !
        </div>
        <p className="text-xs text-muted mb-4">
          Vous ne trouvez pas l'email ? Pensez à vérifier vos spams.
        </p>
        <Link
          href="/connexion"
          className="text-sm text-primary font-medium hover:text-primary-hover transition-colors"
        >
          Aller à la page de connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-sm w-full">
      <h1 className="text-2xl font-bold text-foreground mb-2">
        Création de compte
      </h1>
      <p className="text-muted text-sm mb-8">
        Inscrivez-vous pour organiser vos premiers événements.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-danger/10 text-danger text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-foreground mb-1.5">
              Nom
            </label>
            <input
              id="nom"
              name="nom"
              type="text"
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label htmlFor="prenom" className="block text-sm font-medium text-foreground mb-1.5">
              Prénom
            </label>
            <input
              id="prenom"
              name="prenom"
              type="text"
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div>
          <label htmlFor="telephone" className="block text-sm font-medium text-foreground mb-1.5">
            Téléphone
          </label>
          <input
            id="telephone"
            name="telephone"
            type="tel"
            className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            placeholder="06 12 34 56 78"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            placeholder="vous@exemple.fr"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>

        <div>
          <label htmlFor="password-confirm" className="block text-sm font-medium text-foreground mb-1.5">
            Répéter le mot de passe
          </label>
          <input
            id="password-confirm"
            name="password-confirm"
            type="password"
            required
            className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-medium text-sm transition-colors"
        >
          {loading ? "Création en cours..." : "Créer mon compte"}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-muted leading-relaxed">
        En cr&eacute;ant un compte, vous acceptez nos{" "}
        <Link href="/cgu" className="text-primary hover:text-primary-hover underline transition-colors">
          CGU
        </Link>{" "}
        et notre{" "}
        <Link href="/confidentialite" className="text-primary hover:text-primary-hover underline transition-colors">
          Politique de confidentialit&eacute;
        </Link>
        .
      </p>

      <p className="mt-4 text-center text-sm text-muted">
        D&eacute;j&agrave; inscrit ?{" "}
        <Link href="/connexion" className="text-primary font-medium hover:text-primary-hover transition-colors">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
