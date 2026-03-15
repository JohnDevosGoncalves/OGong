"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function InscriptionPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    // Connexion automatique après inscription
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      // Compte créé mais échec login — rediriger vers connexion
      router.push("/connexion");
      return;
    }

    router.push("/evenements");
    router.refresh();
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
