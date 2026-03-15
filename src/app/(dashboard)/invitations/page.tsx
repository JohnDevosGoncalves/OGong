"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button, Card, Badge } from "@/components/ui";
import { FORMAT_LABELS, COLLAB_ROLE_LABELS } from "@/lib/constants";

interface Invitation {
  id: string;
  role: string;
  accepte: boolean;
  createdAt: string;
  evenement: {
    id: string;
    titre: string;
    format: string;
    date: string;
    heureDebut: string;
    heureFin: string;
    status: string;
  };
  inviteur: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
  };
}

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchInvitations = useCallback(async () => {
    try {
      const res = await fetch("/api/compte/invitations");
      if (res.ok) {
        const data = await res.json();
        setInvitations(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  async function handleAction(invitationId: string, action: "accepter" | "refuser") {
    setActionLoading(invitationId);
    try {
      const res = await fetch("/api/compte/invitations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId, action }),
      });

      if (res.ok) {
        fetchInvitations();
      }
    } catch {
      // silently fail
    } finally {
      setActionLoading(null);
    }
  }

  const pending = invitations.filter((inv) => !inv.accepte);
  const accepted = invitations.filter((inv) => inv.accepte);

  if (loading) {
    return <div className="text-center text-muted py-20">Chargement...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Invitations</h1>
        <p className="text-muted text-sm mt-1">
          Gérez vos invitations à collaborer sur des événements.
        </p>
      </div>

      {/* Invitations en attente */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          En attente ({pending.length})
        </h2>

        {pending.length === 0 ? (
          <Card>
            <p className="text-sm text-muted text-center py-4">
              Aucune invitation en attente.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {pending.map((inv) => {
              const roleConfig = COLLAB_ROLE_LABELS[inv.role] || { label: inv.role, variant: "muted" };
              const isActioning = actionLoading === inv.id;

              return (
                <Card key={inv.id}>
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {inv.evenement.titre}
                        </p>
                        <Badge variant={roleConfig.variant as "primary" | "accent" | "success" | "warning" | "danger" | "muted"}>
                          {roleConfig.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted">
                        {FORMAT_LABELS[inv.evenement.format] || inv.evenement.format} &middot;{" "}
                        {new Date(inv.evenement.date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })} &middot;{" "}
                        {inv.evenement.heureDebut} - {inv.evenement.heureFin}
                      </p>
                      <p className="text-xs text-muted mt-1">
                        Invité par {inv.inviteur.prenom} {inv.inviteur.nom}
                      </p>
                    </div>

                    <div className="flex gap-2 shrink-0 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(inv.id, "refuser")}
                        disabled={isActioning}
                      >
                        Refuser
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAction(inv.id, "accepter")}
                        loading={isActioning}
                      >
                        Accepter
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Collaborations acceptées */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Collaborations actives ({accepted.length})
        </h2>

        {accepted.length === 0 ? (
          <Card>
            <p className="text-sm text-muted text-center py-4">
              Aucune collaboration active.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {accepted.map((inv) => {
              const roleConfig = COLLAB_ROLE_LABELS[inv.role] || { label: inv.role, variant: "muted" };

              return (
                <Card key={inv.id}>
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {inv.evenement.titre}
                        </p>
                        <Badge variant={roleConfig.variant as "primary" | "accent" | "success" | "warning" | "danger" | "muted"}>
                          {roleConfig.label}
                        </Badge>
                        <Badge variant="success">Accepté</Badge>
                      </div>
                      <p className="text-xs text-muted">
                        {FORMAT_LABELS[inv.evenement.format] || inv.evenement.format} &middot;{" "}
                        {new Date(inv.evenement.date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })} &middot;{" "}
                        {inv.evenement.heureDebut} - {inv.evenement.heureFin}
                      </p>
                      <p className="text-xs text-muted mt-1">
                        Invité par {inv.inviteur.prenom} {inv.inviteur.nom}
                      </p>
                    </div>

                    <Link
                      href={`/evenements/${inv.evenement.id}`}
                      className="shrink-0 ml-4"
                    >
                      <Button variant="outline" size="sm">
                        Voir l&apos;événement
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
