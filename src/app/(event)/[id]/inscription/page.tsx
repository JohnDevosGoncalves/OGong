"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Logo from "@/components/layout/Logo";

interface EventInfo {
  id: string;
  titre: string;
  description: string | null;
  format: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  status: string;
  inscriptionFermee: boolean;
  _count: { participants: number };
}

const formatLabels: Record<string, string> = {
  speed_meeting: "Speed meeting",
  team: "Team",
  job_dating: "Job dating",
};

export default function InscriptionEvenementPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ numero: number; message: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/inscription/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setEvent(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de charger l'événement.");
        setLoading(false);
      });
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const body = {
      nom: form.get("nom"),
      prenom: form.get("prenom"),
      email: form.get("email"),
      telephone: form.get("telephone") || null,
    };

    const res = await fetch(`/api/inscription/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setSubmitting(false);

    if (res.ok) {
      setSuccess({ numero: data.numero, message: data.message });
    } else {
      setError(data.error || "Erreur lors de l'inscription.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-muted">Chargement…</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-xl mx-auto py-12 px-6 text-center">
        <Logo size={48} />
        <p className="text-muted mt-4">{error || "Événement introuvable."}</p>
      </div>
    );
  }

  // Inscription confirmée
  if (success) {
    return (
      <div className="max-w-xl mx-auto py-12 px-6">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <Logo size={48} />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{event.titre}</h1>
        </div>

        <div className="bg-surface rounded-xl border border-success/30 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Inscription confirmée !</h2>
          <p className="text-muted mb-4">{success.message}</p>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 text-primary text-3xl font-bold">
            {success.numero}
          </div>
          <p className="text-sm text-muted mt-4">
            Conservez votre numéro, il vous sera attribué le jour de l&apos;événement.
          </p>
        </div>
      </div>
    );
  }

  // Inscriptions fermées
  if (event.inscriptionFermee) {
    return (
      <div className="max-w-xl mx-auto py-12 px-6">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <Logo size={48} />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{event.titre}</h1>
          <p className="text-muted text-sm">
            {new Date(event.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            {" · "}{formatLabels[event.format] || event.format}
            {" · "}{event.heureDebut} — {event.heureFin}
          </p>
        </div>

        <div className="bg-surface rounded-xl border border-border p-8 text-center">
          <p className="text-foreground font-medium mb-2">Les inscriptions sont fermées</p>
          <p className="text-sm text-muted">
            {event.status === "en_cours"
              ? "L'événement est en cours."
              : event.status === "termine"
              ? "L'événement est terminé."
              : "Les inscriptions ne sont pas encore ouvertes."}
          </p>
          <p className="text-sm text-muted mt-3">
            {event._count.participants} participant{event._count.participants > 1 ? "s" : ""} inscrit{event._count.participants > 1 ? "s" : ""}
          </p>
        </div>
      </div>
    );
  }

  // Formulaire d'inscription
  return (
    <div className="max-w-xl mx-auto py-12 px-6">
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <Logo size={48} />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">{event.titre}</h1>
        <p className="text-muted text-sm">
          {new Date(event.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          {" · "}{formatLabels[event.format] || event.format}
          {" · "}{event.heureDebut} — {event.heureFin}
        </p>
        {event.description && (
          <p className="text-muted text-sm mt-2">{event.description}</p>
        )}
        <p className="text-xs text-muted mt-2">
          {event._count.participants} participant{event._count.participants > 1 ? "s" : ""} inscrit{event._count.participants > 1 ? "s" : ""}
        </p>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-5">
          Inscription
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-foreground mb-1.5">Nom *</label>
              <input
                id="nom"
                name="nom"
                type="text"
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label htmlFor="prenom" className="block text-sm font-medium text-foreground mb-1.5">Prénom *</label>
              <input
                id="prenom"
                name="prenom"
                type="text"
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">Email *</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              placeholder="vous@exemple.fr"
            />
          </div>

          <div>
            <label htmlFor="telephone" className="block text-sm font-medium text-foreground mb-1.5">Téléphone</label>
            <input
              id="telephone"
              name="telephone"
              type="tel"
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              placeholder="06 12 34 56 78"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white font-medium text-sm transition-colors mt-2 disabled:opacity-50"
          >
            {submitting ? "Inscription en cours…" : "S'inscrire à l'événement"}
          </button>
        </form>
      </div>
    </div>
  );
}
