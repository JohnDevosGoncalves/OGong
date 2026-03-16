"use client";

import { useEffect, useState, useCallback } from "react";
import { Button, Input, Modal, Badge } from "@/components/ui";

interface AdminUser {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  createdAt: string;
  evenements: number;
  soldeCredits: number;
}

interface UsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  totalPages: number;
  currentUserId: string;
}

const ROLE_OPTIONS = [
  { value: "admin", label: "Administrateur" },
  { value: "animateur", label: "Animateur" },
  { value: "super_admin", label: "Super Admin" },
];

const ROLE_STYLES: Record<string, { label: string; variant: "danger" | "primary" | "accent" }> = {
  super_admin: { label: "Super Admin", variant: "danger" },
  admin: { label: "Administrateur", variant: "primary" },
  animateur: { label: "Animateur", variant: "accent" },
};

export default function AdminUtilisateursPage() {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);

  // Modals
  const [creditModal, setCreditModal] = useState<{ user: AdminUser } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ user: AdminUser } | null>(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditReason, setCreditReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (roleFilter) params.set("role", roleFilter);
    params.set("page", String(page));
    params.set("limit", "20");

    try {
      const res = await fetch(`/api/admin/users?${params}`);
      if (res.status === 403) {
        setError("Accès réservé au super administrateur");
        setLoading(false);
        return;
      }
      const json = await res.json();
      setData(json);
    } catch {
      setError("Impossible de charger les utilisateurs");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounce search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setActionMessage(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const json = await res.json();
      if (!res.ok) {
        setActionMessage({ type: "error", text: json.error });
        return;
      }
      setActionMessage({ type: "success", text: `Rôle modifié avec succès` });
      fetchUsers();
    } catch {
      setActionMessage({ type: "error", text: "Erreur lors de la modification du rôle" });
    }
  };

  const handleGrantCredits = async () => {
    if (!creditModal) return;
    setActionLoading(true);
    setActionMessage(null);

    try {
      const res = await fetch("/api/admin/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: creditModal.user.id,
          montant: parseInt(creditAmount),
          detail: creditReason,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setActionMessage({ type: "error", text: json.error });
        setActionLoading(false);
        return;
      }
      setActionMessage({ type: "success", text: json.message });
      setCreditModal(null);
      setCreditAmount("");
      setCreditReason("");
      fetchUsers();
    } catch {
      setActionMessage({ type: "error", text: "Erreur lors de l'attribution des crédits" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteModal) return;
    setActionLoading(true);
    setActionMessage(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: deleteModal.user.id }),
      });
      const json = await res.json();
      if (!res.ok) {
        setActionMessage({ type: "error", text: json.error });
        setActionLoading(false);
        return;
      }
      setActionMessage({ type: "success", text: "Utilisateur supprimé" });
      setDeleteModal(null);
      fetchUsers();
    } catch {
      setActionMessage({ type: "error", text: "Erreur lors de la suppression" });
    } finally {
      setActionLoading(false);
    }
  };

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-danger font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestion des utilisateurs</h1>
          <p className="text-muted text-sm mt-1">
            {data ? `${data.total} utilisateur(s) sur la plateforme` : "Chargement..."}
          </p>
        </div>
      </div>

      {/* Action message */}
      {actionMessage && (
        <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${actionMessage.type === "success" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
          {actionMessage.text}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Rechercher par nom ou email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        >
          <option value="">Tous les rôles</option>
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="text-center text-muted py-12">Chargement...</div>
        ) : !data || data.users.length === 0 ? (
          <div className="text-center text-muted py-12">Aucun utilisateur trouvé</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface-hover/50">
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">Utilisateur</th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">Email</th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">Rôle</th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">Crédits</th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">Événements</th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">Inscrit le</th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.users.map((user) => {
                  const roleStyle = ROLE_STYLES[user.role] || { label: user.role, variant: "primary" as const };
                  const initials = `${user.prenom[0] || ""}${user.nom[0] || ""}`.toUpperCase();
                  const isCurrentUser = user.id === data.currentUserId;

                  return (
                    <tr key={user.id} className="hover:bg-surface-hover transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <span className="text-sm font-medium text-foreground block truncate">
                              {user.prenom} {user.nom}
                            </span>
                            {isCurrentUser && (
                              <span className="text-xs text-muted">(vous)</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">{user.email}</td>
                      <td className="px-4 py-3">
                        {isCurrentUser ? (
                          <Badge variant={roleStyle.variant}>{roleStyle.label}</Badge>
                        ) : (
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="text-xs font-medium px-2 py-1 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                          >
                            {ROLE_OPTIONS.map((r) => (
                              <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground font-medium">
                        {user.soldeCredits}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {user.evenements}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCreditModal({ user });
                              setCreditAmount("");
                              setCreditReason("");
                            }}
                          >
                            + Crédits
                          </Button>
                          {!isCurrentUser && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => setDeleteModal({ user })}
                            >
                              Supprimer
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted">
              Page {data.page} sur {data.totalPages} ({data.total} résultats)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Grant Credits Modal */}
      <Modal
        isOpen={!!creditModal}
        onClose={() => setCreditModal(null)}
        title="Attribuer des crédits bonus"
      >
        {creditModal && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              Attribuer des crédits à <strong className="text-foreground">{creditModal.user.prenom} {creditModal.user.nom}</strong>
            </p>
            <Input
              label="Nombre de crédits"
              type="number"
              min="1"
              max="1000"
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              placeholder="Ex: 10"
            />
            <Input
              label="Raison"
              value={creditReason}
              onChange={(e) => setCreditReason(e.target.value)}
              placeholder="Ex: Offre de bienvenue"
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setCreditModal(null)}>
                Annuler
              </Button>
              <Button
                loading={actionLoading}
                disabled={!creditAmount || !creditReason || parseInt(creditAmount) < 1}
                onClick={handleGrantCredits}
              >
                Attribuer
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete User Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Supprimer un utilisateur"
      >
        {deleteModal && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-danger/10 border border-danger/20">
              <p className="text-sm text-danger font-medium mb-1">Attention : cette action est irréversible</p>
              <p className="text-sm text-muted">
                Toutes les données de <strong className="text-foreground">{deleteModal.user.prenom} {deleteModal.user.nom}</strong> seront
                définitivement supprimées (événements, participants, crédits, paiements).
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDeleteModal(null)}>
                Annuler
              </Button>
              <Button
                variant="danger"
                loading={actionLoading}
                onClick={handleDeleteUser}
              >
                Supprimer définitivement
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
