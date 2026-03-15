"use client";

import { useState } from "react";

interface AddParticipantFormProps {
  eventId: string;
  onAdded: () => void;
}

export default function AddParticipantForm({ eventId, onAdded }: AddParticipantFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const formData = new FormData(form);

    const body = {
      nom: formData.get("nom"),
      prenom: formData.get("prenom"),
      email: formData.get("email"),
      telephone: formData.get("telephone") || null,
    };

    if (!body.nom || !body.prenom || !body.email) {
      setError("Nom, prénom et email sont requis.");
      return;
    }

    const res = await fetch(`/api/evenements/${eventId}/participants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erreur lors de l'ajout.");
      return;
    }

    form.reset();
    setShowForm(false);
    setError("");
    onAdded();
  }

  return (
    <>
      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 py-2 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Ajouter
      </button>

      {error && (
        <div className="col-span-full mb-4 p-3 rounded-lg bg-warning/10 border border-warning/20 text-warning text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="col-span-full mb-6 p-4 rounded-lg border border-border bg-background">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <input
              name="nom"
              placeholder="Nom *"
              required
              className="px-3 py-2 rounded-lg border border-border bg-surface text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input
              name="prenom"
              placeholder="Prénom *"
              required
              className="px-3 py-2 rounded-lg border border-border bg-surface text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input
              name="email"
              type="email"
              placeholder="Email *"
              required
              className="px-3 py-2 rounded-lg border border-border bg-surface text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input
              name="telephone"
              placeholder="Téléphone"
              className="px-3 py-2 rounded-lg border border-border bg-surface text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="py-2 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors"
            >
              Ajouter
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(""); }}
              className="py-2 px-4 rounded-lg border border-border text-sm text-muted hover:bg-surface-hover transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </>
  );
}
