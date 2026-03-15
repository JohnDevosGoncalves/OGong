"use client";

import { useEffect, useState } from "react";

interface UserRow {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  createdAt: string;
  _count: { evenements: number };
}

const roleLabels: Record<string, { label: string; class: string }> = {
  super_admin: { label: "Super Admin", class: "bg-danger/10 text-danger" },
  admin: { label: "Admin", class: "bg-primary/10 text-primary" },
  animateur: { label: "Animateur", class: "bg-accent/10 text-accent" },
};

export default function UtilisateursPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer l'utilisateur courant
    fetch("/api/compte")
      .then((res) => res.json())
      .then((data) => {
        setCurrentUserId(data.id);
        // Pour l'instant, afficher uniquement l'utilisateur courant
        // La gestion multi-utilisateurs nécessitera un modèle Organisation
        setUsers([
          {
            id: data.id,
            nom: data.nom,
            prenom: data.prenom,
            email: data.email,
            role: data.role,
            createdAt: data.createdAt,
            _count: { evenements: 0 },
          },
        ]);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Charger le nombre d'événements
    fetch("/api/statistiques")
      .then((res) => res.json())
      .then((data) => {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === currentUserId
              ? { ...u, _count: { evenements: data.totalEvenements || 0 } }
              : u
          )
        );
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <div className="text-center text-muted py-20">Chargement…</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Utilisateurs</h1>
          <p className="text-muted text-sm mt-1">
            Gérez les membres de votre organisation.
          </p>
        </div>
        <button
          className="flex items-center gap-2 py-2.5 px-5 rounded-lg bg-primary hover:bg-primary-hover text-white font-medium text-sm transition-colors opacity-50 cursor-not-allowed"
          disabled
          title="Bientôt disponible"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Inviter un utilisateur
        </button>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6">
        {users.length === 0 ? (
          <p className="text-sm text-muted text-center py-12">
            Les utilisateurs de votre organisation apparaîtront ici.
          </p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-2">Utilisateur</th>
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-2">Email</th>
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-2">Rôle</th>
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-2">Membre depuis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => {
                const role = roleLabels[u.role] || { label: u.role, class: "bg-muted/10 text-muted" };
                const initials = `${u.prenom[0] || ""}${u.nom[0] || ""}`.toUpperCase();
                return (
                  <tr key={u.id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                          {initials}
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {u.prenom} {u.nom}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${role.class}`}>
                        {role.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted">
                      {new Date(u.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
          <p className="text-sm text-primary font-medium mb-1">Gestion multi-utilisateurs</p>
          <p className="text-xs text-muted">
            La fonctionnalité d&apos;invitation et de gestion des rôles sera disponible dans la version Entreprise.
          </p>
        </div>
      </div>
    </div>
  );
}
