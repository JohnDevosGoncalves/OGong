"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { Modal } from "@/components/ui";

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

  // Export state
  const [exporting, setExporting] = useState(false);

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

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

  async function handleExportData() {
    setExporting(true);
    try {
      const res = await fetch("/api/compte/export");
      if (!res.ok) {
        setMessage({ type: "error", text: "Erreur lors de l'export des données." });
        return;
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition");
      const filenameMatch = disposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] ?? "ogong-donnees.json";

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage({ type: "success", text: "Vos données ont été téléchargées." });
    } catch {
      setMessage({ type: "error", text: "Erreur lors de l'export des données." });
    } finally {
      setExporting(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleteError("");

    if (deleteConfirmation !== "SUPPRIMER") {
      setDeleteError("Veuillez taper SUPPRIMER pour confirmer.");
      return;
    }

    if (!deletePassword) {
      setDeleteError("Veuillez saisir votre mot de passe.");
      return;
    }

    setDeleting(true);

    try {
      const res = await fetch("/api/compte", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: deletePassword,
          confirmation: deleteConfirmation,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        await signOut({ callbackUrl: "/connexion" });
      } else {
        setDeleteError(data.error || "Erreur lors de la suppression.");
        setDeleting(false);
      }
    } catch {
      setDeleteError("Erreur lors de la suppression du compte.");
      setDeleting(false);
    }
  }

  function closeDeleteModal() {
    if (deleting) return;
    setShowDeleteModal(false);
    setDeletePassword("");
    setDeleteConfirmation("");
    setDeleteError("");
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

        {/* Mes données (RGPD) */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">Mes données</h2>
          <p className="text-sm text-muted mb-4">
            Conformément au RGPD, vous pouvez exporter l'ensemble de vos données personnelles.
          </p>
          <button
            onClick={handleExportData}
            disabled={exporting}
            className="inline-flex items-center gap-2 py-2.5 px-5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-surface-hover transition-colors disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {exporting ? "Export en cours…" : "Télécharger mes données"}
          </button>
        </div>

        {/* Zone dangereuse */}
        <div className="rounded-xl border-2 border-danger/30 bg-danger/5 p-6">
          <div className="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-danger mt-0.5 shrink-0">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div>
              <h2 className="text-lg font-semibold text-danger mb-1">Zone dangereuse</h2>
              <p className="text-sm text-muted mb-4">
                La suppression de votre compte est irréversible. Toutes vos données seront définitivement supprimées.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="py-2.5 px-5 rounded-lg bg-danger hover:bg-danger/90 text-white text-sm font-medium transition-colors"
              >
                Supprimer mon compte
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      <Modal isOpen={showDeleteModal} onClose={closeDeleteModal} title="Supprimer votre compte">
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-danger/10 border border-danger/20">
            <p className="text-sm text-danger font-medium">
              Cette action est irréversible.
            </p>
            <p className="text-sm text-danger/80 mt-1">
              Toutes vos données seront définitivement supprimées : événements, participants, collaborations, crédits et paiements.
            </p>
          </div>

          {deleteError && (
            <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-sm text-danger">
              {deleteError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Mot de passe
            </label>
            <input
              type="password"
              placeholder="Saisissez votre mot de passe"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              disabled={deleting}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-danger/30 focus:border-danger transition-colors disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Tapez <span className="font-bold text-danger">SUPPRIMER</span> pour confirmer
            </label>
            <input
              type="text"
              placeholder="SUPPRIMER"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              disabled={deleting}
              autoComplete="off"
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-danger/30 focus:border-danger transition-colors disabled:opacity-50"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeDeleteModal}
              disabled={deleting}
              className="py-2.5 px-5 rounded-lg border border-border text-sm font-medium text-muted hover:bg-surface-hover transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleting || deleteConfirmation !== "SUPPRIMER" || !deletePassword}
              className="py-2.5 px-5 rounded-lg bg-danger hover:bg-danger/90 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {deleting ? "Suppression…" : "Confirmer la suppression"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
