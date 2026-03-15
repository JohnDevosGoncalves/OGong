import type { Metadata } from "next";
import Logo from "@/components/layout/Logo";

export const metadata: Metadata = {
  title: "Inscription à l'événement",
};

export default function InscriptionEvenementPage() {
  return (
    <div className="max-w-xl mx-auto py-12 px-6">
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <Logo size={48} />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Demo Day — Wild Code School
        </h1>
        <p className="text-muted text-sm">
          20 mars 2024 · Speed meeting · 14h00 - 17h00
        </p>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-5">
          Inscription des participants
        </h2>

        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-foreground mb-1.5">
                Nom
              </label>
              <input
                id="nom"
                type="text"
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label htmlFor="prenom" className="block text-sm font-medium text-foreground mb-1.5">
                Prénom
              </label>
              <input
                id="prenom"
                type="text"
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              placeholder="vous@exemple.fr"
            />
          </div>

          <div>
            <label htmlFor="telephone" className="block text-sm font-medium text-foreground mb-1.5">
              Téléphone
            </label>
            <input
              id="telephone"
              type="tel"
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              placeholder="06 12 34 56 78"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white font-medium text-sm transition-colors mt-2"
          >
            S&apos;inscrire à l&apos;événement
          </button>
        </form>
      </div>
    </div>
  );
}
