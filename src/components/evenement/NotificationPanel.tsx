"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface NotificationPanelProps {
  evenementId: string;
  nbParticipants: number;
  status: string;
}

type NotificationType = "reminder" | "start" | "results";

interface NotificationOption {
  type: NotificationType;
  label: string;
  description: string;
}

const NOTIFICATION_OPTIONS: NotificationOption[] = [
  {
    type: "reminder",
    label: "Envoyer un rappel",
    description: "Rappeler aux participants la date et l'heure de l'événement.",
  },
  {
    type: "start",
    label: "Notifier le début",
    description: "Informer les participants que l'événement vient de commencer.",
  },
  {
    type: "results",
    label: "Envoyer les résultats",
    description: "Partager un résumé des rencontres avec tous les participants.",
  },
];

export function NotificationPanel({
  evenementId,
  nbParticipants,
  status,
}: NotificationPanelProps) {
  const [loadingType, setLoadingType] = useState<NotificationType | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);

  async function handleSend(type: NotificationType) {
    setLoadingType(type);
    setToast(null);

    try {
      const res = await fetch(`/api/evenements/${evenementId}/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      const data = await res.json();

      if (!res.ok) {
        setToast({
          message: data.error ?? "Une erreur est survenue.",
          variant: "error",
        });
        return;
      }

      const failedMsg =
        data.failed > 0 ? ` (${data.failed} échec${data.failed > 1 ? "s" : ""})` : "";
      setToast({
        message: `${data.sent} email${data.sent > 1 ? "s" : ""} envoyé${data.sent > 1 ? "s" : ""} avec succès${failedMsg}.`,
        variant: data.failed > 0 ? "error" : "success",
      });
    } catch {
      setToast({
        message: "Erreur réseau. Veuillez réessayer.",
        variant: "error",
      });
    } finally {
      setLoadingType(null);
    }
  }

  function isOptionEnabled(type: NotificationType): boolean {
    switch (type) {
      case "reminder":
        return status === "ouvert" || status === "en_cours";
      case "start":
        return status === "en_cours";
      case "results":
        return status === "termine";
      default:
        return false;
    }
  }

  return (
    <Card
      title="Notifications"
      subtitle={`${nbParticipants} participant${nbParticipants > 1 ? "s" : ""} recevront l'email`}
    >
      <div className="space-y-3">
        {NOTIFICATION_OPTIONS.map((option) => {
          const enabled = isOptionEnabled(option.type);
          const isLoading = loadingType === option.type;

          return (
            <div
              key={option.type}
              className="flex items-center justify-between gap-4 rounded-lg border border-border p-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {option.label}
                </p>
                <p className="text-xs text-muted mt-0.5">
                  {option.description}
                </p>
              </div>
              <Button
                size="sm"
                variant={enabled ? "primary" : "outline"}
                disabled={!enabled || loadingType !== null || nbParticipants === 0}
                loading={isLoading}
                onClick={() => handleSend(option.type)}
              >
                Envoyer
              </Button>
            </div>
          );
        })}
      </div>

      {toast && (
        <div
          className={`mt-4 rounded-lg px-4 py-3 text-sm ${
            toast.variant === "success"
              ? "bg-success/10 text-success"
              : "bg-danger/10 text-danger"
          }`}
        >
          {toast.message}
        </div>
      )}

      {nbParticipants === 0 && (
        <p className="mt-4 text-xs text-muted">
          Aucun participant inscrit. Les notifications seront disponibles une
          fois des participants ajoutés.
        </p>
      )}
    </Card>
  );
}
