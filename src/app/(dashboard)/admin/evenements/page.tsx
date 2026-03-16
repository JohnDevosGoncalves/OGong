"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button, Input, Modal, Badge } from "@/components/ui";

interface AdminEvent {
  id: string;
  titre: string;
  format: string;
  date: string;
  status: string;
  createdAt: string;
  createur: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
  };
  participants: number;
}

interface EventsResponse {
  events: AdminEvent[];
  total: number;
  page: number;
  totalPages: number;
}

const FORMAT_LABELS: Record<string, string> = {
  speed_meeting: "Speed Meeting",
  team: "Team",
  job_dating: "Job Dating",
};

const STATUS_STYLES: Record<string, { label: string; variant: "muted" | "primary" | "warning" | "success" }> = {
  brouillon: { label: "Brouillon", variant: "muted" },
  ouvert: { label: "Ouvert", variant: "primary" },
  en_cours: { label: "En cours", variant: "warning" },
  termine: { label: "Terminé", variant: "success" },
};

const FORMAT_OPTIONS = [
  { value: "speed_meeting", label: "Speed Meeting" },
  { value: "team", label: "Team" },
  { value: "job_dating", label: "Job Dating" },
];

const STATUS_OPTIONS = [
  { value: "brouillon", label: "Brouillon" },
  { value: "ouvert", label: "Ouvert" },
  { value: "en_cours", label: "En cours" },
  { value: "termine", label: "Terminé" },
];

export default function AdminEvenementsPage() {
  const [data, setData] = useState<EventsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [formatFilter, setFormatFilter] = useState("");
  const [page, setPage] = useState(1);

  const [deleteModal, setDeleteModal] = useState<{ event: AdminEvent } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (formatFilter) params.set("format", formatFilter);
    params.set("page", String(page));
    params.set("limit", "20");

    try {
      const res = await fetch(`/api/admin/events?${params}`);
      if (res.status === 403) {
        setError("Accès réservé au super administrateur");
        setLoading(false);
        return;
      }
      const json = await res.json();
      setData(json);
    } catch {
      setError("Impossible de charger les événements");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, formatFilter, page]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleDelete = async () => {
    if (!deleteModal) return;
    setActionLoading(true);
    setActionMessage(null);

    try {
      const res = await fetch("/api/admin/events", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: deleteModal.event.id }),
      });
      const json = await res.json();
      if (!res.ok) {
        setActionMessage({ type: "error", text: json.error });
        setActionLoading(false);
        return;
      }
      setActionMessage({ type: "success", text: "Événement supprimé" });
      setDeleteModal(null);
      fetchEvents();
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
          <h1 className="text-2xl font-bold text-foreground">Tous les événements</h1>
          <p className="text-muted text-sm mt-1">
            {data ? `${data.total} événement(s) sur la plateforme` : "Chargement..."}
          </p>
        </div>
      </div>

      {actionMessage && (
        <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${actionMessage.type === "success" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
          {actionMessage.text}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Rechercher par titre ou créateur..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        >
          <option value="">Tous les statuts</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={formatFilter}
          onChange={(e) => { setFormatFilter(e.target.value); setPage(1); }}
          className="px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        >
          <option value="">Tous les formats</option>
          {FORMAT_OPTIONS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="text-center text-muted py-12">Chargement...</div>
        ) : !data || data.events.length === 0 ? (
          <div className="text-center text-muted py-12">Aucun événement trouvé</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface-hover/50">
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">Titre</th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">Créateur</th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">Format</th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">Date</th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">Statut</th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">Participants</th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.events.map((evt) => {
                  const statusStyle = STATUS_STYLES[evt.status] || { label: evt.status, variant: "muted" as const };
                  return (
                    <tr key={evt.id} className="hover:bg-surface-hover transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-foreground">{evt.titre}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="text-sm text-foreground">{evt.createur.prenom} {evt.createur.nom}</span>
                          <span className="text-xs text-muted block">{evt.createur.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {FORMAT_LABELS[evt.format] || evt.format}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {new Date(evt.date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusStyle.variant}>{statusStyle.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground font-medium">
                        {evt.participants}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link href={`/evenements/${evt.id}`}>
                            <Button variant="outline" size="sm">
                              Voir
                            </Button>
                          </Link>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setDeleteModal({ event: evt })}
                          >
                            Supprimer
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

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

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Supprimer un événement"
      >
        {deleteModal && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-danger/10 border border-danger/20">
              <p className="text-sm text-danger font-medium mb-1">Attention : cette action est irréversible</p>
              <p className="text-sm text-muted">
                L&apos;événement <strong className="text-foreground">{deleteModal.event.titre}</strong> et toutes
                ses données (participants, tours, tables) seront définitivement supprimés.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDeleteModal(null)}>
                Annuler
              </Button>
              <Button
                variant="danger"
                loading={actionLoading}
                onClick={handleDelete}
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
