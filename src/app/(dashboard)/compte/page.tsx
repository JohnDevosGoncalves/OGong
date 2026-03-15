import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon compte",
};

export default function ComptePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Mon compte</h1>
      <p className="text-muted text-sm mb-8">
        Gérez vos informations personnelles.
      </p>

      <div className="max-w-2xl space-y-6">
        {/* Informations */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-5">
            Vos informations
          </h2>

          <div className="flex items-center gap-6 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
              MP
            </div>
            <div>
              <p className="text-foreground font-medium">Marie Pierre</p>
              <p className="text-sm text-muted">Super Admin</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Nom
                </label>
                <input
                  type="text"
                  defaultValue="Pierre"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Prénom
                </label>
                <input
                  type="text"
                  defaultValue="Marie"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Téléphone
              </label>
              <input
                type="tel"
                defaultValue="06 12 34 56 78"
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email
              </label>
              <input
                type="email"
                defaultValue="marie@exemple.fr"
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button className="py-2.5 px-5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors">
              Enregistrer
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-surface rounded-xl border border-border p-6 space-y-3">
          <button className="text-sm text-primary hover:text-primary-hover font-medium transition-colors">
            Modifier mon mot de passe
          </button>
          <br />
          <button className="text-sm text-danger hover:text-danger/80 font-medium transition-colors">
            Supprimer mon compte
          </button>
        </div>
      </div>
    </div>
  );
}
