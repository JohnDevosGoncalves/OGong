import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Utilisateurs",
};

export default function UtilisateursPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Utilisateurs</h1>
          <p className="text-muted text-sm mt-1">
            Gérez les membres de votre organisation.
          </p>
        </div>
        <button className="flex items-center gap-2 py-2.5 px-5 rounded-lg bg-primary hover:bg-primary-hover text-white font-medium text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Inviter un utilisateur
        </button>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6">
        <p className="text-sm text-muted text-center py-12">
          Les utilisateurs de votre organisation apparaîtront ici.
        </p>
      </div>
    </div>
  );
}
