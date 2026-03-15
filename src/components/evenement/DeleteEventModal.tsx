"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteEventModalProps {
  eventId: string;
  eventTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteEventModal({ eventId, eventTitle, isOpen, onClose }: DeleteEventModalProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/evenements/${eventId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.push("/evenements");
    } else {
      setDeleting(false);
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => !deleting && onClose()}
      />
      <div className="relative bg-surface rounded-xl border border-border p-6 max-w-md w-full mx-4 shadow-xl">
        <h3 className="text-lg font-semibold text-foreground mb-2">Confirmer la suppression</h3>
        <p className="text-sm text-muted mb-6">
          Êtes-vous sûr de vouloir supprimer l&apos;événement <span className="font-medium text-foreground">{eventTitle}</span> ?
          Cette action est irréversible.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={deleting}
            className="py-2 px-4 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-surface-hover transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="py-2 px-4 rounded-lg bg-danger hover:bg-danger/90 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {deleting ? "Suppression..." : "Supprimer définitivement"}
          </button>
        </div>
      </div>
    </div>
  );
}
