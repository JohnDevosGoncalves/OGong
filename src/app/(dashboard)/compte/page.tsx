"use client";

import { useEffect, useState } from "react";

interface UserInfo {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  role: string;
  createdAt: string;
  societe: { id: string; nom: string } | null;
}

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Administrateur",
  animateur: "Animateur",
};

export default function ComptePage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetch("/api/compte")
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage({ type: "", text: "" });

    const form = new FormData(e.currentTarget);
    const body = {
      nom: form.get("nom"),
      prenom: form.get("prenom"),
      email: form.get("email"),
      telephone: form.get("telephone") || null,
    };

    const res = await fetch("/api/compte", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setSaving(false);

    if (res.ok) {
      setUser({ ...user, ...data });
      setMessage({ type: "success", text: "Informations mises à jour." });
    } else {
      setMessage({ type: "error", text: data.error || "Erreur lors de la sauvegarde." });
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "Les mots de passe ne correspondent pas." });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: "error", text: "Le mot de passe doit faire au moins 6 caractères." });
      return;
    }

    const res = await fetch("/api/compte", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage({ type: "success", text: "Mot de passe modifié avec succès." });
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      setMessage({ type: "error", text: data.error || "Erreur lors du changement." });
    }
  }

  if (loading) {
    return <div className="text-center text-muted py-20">Chargement…</div>;
  }

  if (!user) {
    return <div className="text-center text-muted py-20">Impossible de charger le profil.</div>;
  }

  const initials = `${user.prenom[0] || ""}${user.nom[0] || ""}`.toUpperCase();

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Mon compte</h1>
      <p className="text-muted text-sm mb-8">
        Gérez vos informations personnelles.
      </p>

      {message.text && (
        <div
          className={`mb-6 p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-success/10 border border-success/20 text-success"
              : "bg-danger/10 border border-danger/20 text-danger"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="max-w-2xl space-y-6">
        {/* Informations */}
        <form onSubmit={handleSave} className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-5">
            Vos informations
          </h2>

          <div className="flex items-center gap-6 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
              {initials}
            </div>
            <div>
              <p className="text-foreground font-medium">
                {user.prenom} {user.nom}
              </p>
              <p className="text-sm text-muted">{roleLabels[user.role] || user.role}</p>
              {user.societe && (
                <p className="text-xs text-muted mt-0.5">{user.societe.nom}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Nom</label>
                <input
                  name="nom"
                  type="text"
                  defaultValue={user.nom}
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Prénom</label>
                <input
                  name="prenom"
                  type="text"
                  defaultValue={user.prenom}
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Téléphone</label>
              <input
                name="telephone"
                type="tel"
                defaultValue={user.telephone || ""}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input
                name="email"
                type="email"
                defaultValue={user.email}
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={saving}
              className="py-2.5 px-5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>

        {/* Mot de passe */}
        <div className="bg-surface rounded-xl border border-border p-6">
          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="text-sm text-primary hover:text-primary-hover font-medium transition-colors"
            >
              Modifier mon mot de passe
            </button>
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">Changer le mot de passe</h3>
              <input
                type="password"
                placeholder="Mot de passe actuel"
                required
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
              />
              <input
                type="password"
                placeholder="Nouveau mot de passe (min. 6 caractères)"
                required
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
              />
              <input
                type="password"
                placeholder="Confirmer le nouveau mot de passe"
                required
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
              />
              <div className="flex gap-2">
                <button type="submit" className="py-2 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors">
                  Valider
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  }}
                  className="py-2 px-4 rounded-lg border border-border text-sm text-muted hover:bg-surface-hover transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Date inscription */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <p className="text-xs text-muted">
            Membre depuis le{" "}
            {new Date(user.createdAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
