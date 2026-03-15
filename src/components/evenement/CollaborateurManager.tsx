"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, Input, Card, Modal, Badge } from "@/components/ui";
import { COLLAB_ROLE_LABELS, COLLAB_STATUS_LABELS } from "@/lib/constants";

interface CollaborateurUser {
  id: string;
  nom: string;
  prenom: string;
  email: string;
}

interface CollaborateurInviteur {
  id: string;
  nom: string;
  prenom: string;
}

interface Collaborateur {
  id: string;
  role: string;
  userId: string;
  evenementId: string;
  accepte: boolean;
  createdAt: string;
  user: CollaborateurUser;
  inviteur: CollaborateurInviteur;
}

interface CollaborateurManagerProps {
  eventId: string;
}

export default function CollaborateurManager({ eventId }: CollaborateurManagerProps) {
  const [collaborateurs, setCollaborateurs] = useState<Collaborateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"animateur" | "co_organisateur">("animateur");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [error, setError] = useState("");
  const [removeId, setRemoveId] = useState<string | null>(null);

  const fetchCollaborateurs = useCallback(async () => {
    try {
      const res = await fetch(`/api/evenements/${eventId}/collaborateurs`);
      if (res.ok) {
        const data = await res.json();
        setCollaborateurs(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchCollaborateurs();
  }, [fetchCollaborateurs]);

  async function handleInvite() {
    setError("");
    setInviteLoading(true);

    try {
      const res = await fetch(`/api/evenements/${eventId}/collaborateurs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de l'invitation.");
        return;
      }

      setEmail("");
      setRole("animateur");
      setShowInviteModal(false);
      fetchCollaborateurs();
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setInviteLoading(false);
    }
  }

  async function handleRemove(collaborateurId: string) {
    try {
      const res = await fetch(
        `/api/evenements/${eventId}/collaborateurs?collaborateurId=${collaborateurId}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        fetchCollaborateurs();
      }
    } catch {
      // silently fail
    } finally {
      setRemoveId(null);
    }
  }

  const roleConfig = (r: string) =>
    COLLAB_ROLE_LABELS[r] || { label: r, variant: "muted" };
  const statusConfig = (accepte: boolean) =>
    accepte ? COLLAB_STATUS_LABELS.accepte : COLLAB_STATUS_LABELS.en_attente;

  return (
    <Card title="Collaborateurs" subtitle="Invitez des utilisateurs pour co-gérer cet événement.">
      {/* Bouton inviter */}
      <div className="flex justify-end mb-4">
        <Button size="sm" onClick={() => setShowInviteModal(true)}>
          Inviter un collaborateur
        </Button>
      </div>

      {/* Liste */}
      {loading ? (
        <p className="text-sm text-muted">Chargement...</p>
      ) : collaborateurs.length === 0 ? (
        <p className="text-sm text-muted">Aucun collaborateur pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {collaborateurs.map((collab) => {
            const { label: roleLabel, variant: roleVariant } = roleConfig(collab.role);
            const { label: statusLabel, variant: statusVariant } = statusConfig(collab.accepte);

            return (
              <div
                key={collab.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-background"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {collab.user.prenom} {collab.user.nom}
                    </p>
                    <p className="text-xs text-muted truncate">{collab.user.email}</p>
                  </div>
                  <Badge variant={roleVariant as "primary" | "accent" | "success" | "warning" | "danger" | "muted"}>
                    {roleLabel}
                  </Badge>
                  <Badge variant={statusVariant as "primary" | "accent" | "success" | "warning" | "danger" | "muted"}>
                    {statusLabel}
                  </Badge>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRemoveId(collab.id)}
                  className="text-danger hover:text-danger shrink-0"
                >
                  Retirer
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal invitation */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => {
          setShowInviteModal(false);
          setError("");
          setEmail("");
        }}
        title="Inviter un collaborateur"
      >
        <div className="space-y-4">
          <Input
            label="Email de l'utilisateur"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="exemple@email.com"
            error={error || undefined}
          />

          <div className="w-full">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Rôle
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "animateur" | "co_organisateur")}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            >
              <option value="animateur">Animateur</option>
              <option value="co_organisateur">Co-organisateur</option>
            </select>
            <p className="mt-1.5 text-xs text-muted">
              {role === "co_organisateur"
                ? "Peut modifier l'événement et gérer les participants."
                : "Peut consulter et animer l'événement le jour J."}
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowInviteModal(false);
                setError("");
                setEmail("");
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleInvite}
              loading={inviteLoading}
              disabled={!email.trim()}
            >
              Envoyer l&apos;invitation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal confirmation suppression */}
      <Modal
        isOpen={!!removeId}
        onClose={() => setRemoveId(null)}
        title="Retirer le collaborateur"
      >
        <p className="text-sm text-muted mb-6">
          Êtes-vous sûr de vouloir retirer ce collaborateur ? Il n&apos;aura plus accès à cet événement.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setRemoveId(null)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={() => removeId && handleRemove(removeId)}>
            Retirer
          </Button>
        </div>
      </Modal>
    </Card>
  );
}
