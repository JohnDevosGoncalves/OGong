"use client";

import { useState } from "react";
import Link from "next/link";

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Pour l'instant, on simule l'envoi (pas de service email configuré)
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="max-w-sm w-full text-center">
        <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Email envoyé !</h1>
        <p className="text-muted text-sm mb-6">
          Si un compte existe avec l&apos;adresse <strong className="text-foreground">{email}</strong>,
          vous recevrez un lien de réinitialisation sous quelques minutes.
        </p>
        <p className="text-xs text-muted mb-6">
          Pensez à vérifier vos courriers indésirables.
        </p>
        <Link
          href="/connexion"
          className="inline-block py-2.5 px-5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors"
        >
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-sm w-full">
      <h1 className="text-2xl font-bold text-foreground mb-2">
        Mot de passe oublié
      </h1>
      <p className="text-muted text-sm mb-8">
        Entrez votre email, nous vous enverrons un lien de réinitialisation.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            placeholder="vous@exemple.fr"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white font-medium text-sm transition-colors"
        >
          Envoyer le lien
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/connexion" className="text-primary font-medium hover:text-primary-hover transition-colors">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
