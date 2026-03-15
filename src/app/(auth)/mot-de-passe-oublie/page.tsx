import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
};

export default function MotDePasseOubliePage() {
  return (
    <div className="max-w-sm w-full">
      <h1 className="text-2xl font-bold text-foreground mb-2">
        Mot de passe oublié
      </h1>
      <p className="text-muted text-sm mb-8">
        Entrez votre email, nous vous enverrons un lien de réinitialisation.
      </p>

      <form className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
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
