"use client";

import { useState } from "react";

const formats = [
  {
    id: "speed_meeting",
    label: "Speed meeting",
    description: "Rencontres 1 à 1, tours minutés",
    icon: "1to1",
    color: "border-primary/30 bg-primary/5",
    activeColor: "border-primary bg-primary/10 ring-2 ring-primary/20",
  },
  {
    id: "team",
    label: "Team",
    description: "Sessions en équipe, tailles XS à XL",
    icon: "team",
    color: "border-accent/30 bg-accent/5",
    activeColor: "border-accent bg-accent/10 ring-2 ring-accent/20",
  },
  {
    id: "job_dating",
    label: "Job dating",
    description: "Rencontres avec exposants et créneaux",
    icon: "expo",
    color: "border-success/30 bg-success/5",
    activeColor: "border-success bg-success/10 ring-2 ring-success/20",
  },
];

export interface EventFormData {
  titre: string;
  description: string | null;
  messageFin: string | null;
  format: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  tempsParoleTour: number;
  tempsPauseTour: number;
  debutPause: string | null;
  finPause: string | null;
}

interface EvenementFormProps {
  initialData?: EventFormData;
  onSubmit: (data: EventFormData) => Promise<void>;
  isEdit: boolean;
  submitLabel: string;
  submittingLabel: string;
  formatDisabled?: boolean;
  cancelHref?: string;
}

export default function EvenementForm({
  initialData,
  onSubmit,
  isEdit,
  submitLabel,
  submittingLabel,
  formatDisabled = false,
  cancelHref,
}: EvenementFormProps) {
  const [selectedFormat, setSelectedFormat] = useState(initialData?.format || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const paroleMinDefault = initialData ? Math.floor(initialData.tempsParoleTour / 60) : 2;
  const paroleSecDefault = initialData ? initialData.tempsParoleTour % 60 : 0;
  const pauseMinDefault = initialData ? Math.floor(initialData.tempsPauseTour / 60) : 0;
  const pauseSecDefault = initialData ? initialData.tempsPauseTour % 60 : 30;
  const dateValue = initialData?.date ? initialData.date.substring(0, 10) : "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const paroleMin = parseInt(formData.get("parole-min") as string) || 0;
    const paroleSec = parseInt(formData.get("parole-sec") as string) || 0;
    const pauseMin = parseInt(formData.get("pause-min") as string) || 0;
    const pauseSec = parseInt(formData.get("pause-sec") as string) || 0;

    const body: EventFormData = {
      titre: formData.get("titre") as string,
      description: (formData.get("description") as string) || null,
      messageFin: (formData.get("messageFin") as string) || null,
      format: selectedFormat,
      date: formData.get("date") as string,
      heureDebut: formData.get("heureDebut") as string,
      heureFin: formData.get("heureFin") as string,
      tempsParoleTour: paroleMin * 60 + paroleSec,
      tempsPauseTour: pauseMin * 60 + pauseSec,
      debutPause: (formData.get("debutPause") as string) || null,
      finPause: (formData.get("finPause") as string) || null,
    };

    if (!body.titre || !body.format || !body.date || !body.heureDebut || !body.heureFin) {
      setError("Veuillez remplir tous les champs obligatoires et sélectionner un format.");
      setSubmitting(false);
      return;
    }

    try {
      await onSubmit(body);
    } catch {
      setError("Erreur réseau. Réessayez.");
      setSubmitting(false);
    }
  }

  return (
    <>
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Informations générales */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-5">
            Informations générales
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="titre" className="block text-sm font-medium text-foreground mb-1.5">
                Titre *
              </label>
              <input
                id="titre"
                name="titre"
                type="text"
                required
                defaultValue={initialData?.titre || ""}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                placeholder="Ex: Demo Day 2024"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1.5">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={initialData?.description || ""}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
                placeholder="Décrivez votre événement..."
              />
            </div>

            <div>
              <label htmlFor="messageFin" className="block text-sm font-medium text-foreground mb-1.5">
                Message de fin
              </label>
              <input
                id="messageFin"
                name="messageFin"
                type="text"
                defaultValue={initialData?.messageFin || ""}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                placeholder="Merci pour votre participation !"
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-foreground mb-1.5">
                Date *
              </label>
              <input
                id="date"
                name="date"
                type="date"
                required
                defaultValue={dateValue}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Durées de l'événement */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-5">
            Durées de l&apos;événement
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="heureDebut" className="block text-sm font-medium text-foreground mb-1.5">
                  Heure de début *
                </label>
                <input
                  id="heureDebut"
                  name="heureDebut"
                  type="time"
                  required
                  defaultValue={initialData?.heureDebut || ""}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label htmlFor="heureFin" className="block text-sm font-medium text-foreground mb-1.5">
                  Heure de fin *
                </label>
                <input
                  id="heureFin"
                  name="heureFin"
                  type="time"
                  required
                  defaultValue={initialData?.heureFin || ""}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Temps de parole / tour
                </label>
                <div className="flex items-center gap-2">
                  <input
                    name="parole-min"
                    type="number"
                    min={0}
                    defaultValue={paroleMinDefault}
                    placeholder="MM"
                    className="w-16 px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                  <span className="text-muted">:</span>
                  <input
                    name="parole-sec"
                    type="number"
                    min={0}
                    max={59}
                    defaultValue={paroleSecDefault}
                    placeholder="SS"
                    className="w-16 px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Temps de pause / tour
                </label>
                <div className="flex items-center gap-2">
                  <input
                    name="pause-min"
                    type="number"
                    min={0}
                    defaultValue={pauseMinDefault}
                    placeholder="MM"
                    className="w-16 px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                  <span className="text-muted">:</span>
                  <input
                    name="pause-sec"
                    type="number"
                    min={0}
                    max={59}
                    defaultValue={pauseSecDefault}
                    placeholder="SS"
                    className="w-16 px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-muted">
              Temps minimum recommandé : 1 min 10 s pour la parole, 30 s pour la pause.
            </p>

            <div className="pt-2 border-t border-border">
              <p className="text-sm font-medium text-foreground mb-3">
                Pause optionnelle
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="debutPause" className="block text-xs text-muted mb-1">
                    Début pause
                  </label>
                  <input
                    id="debutPause"
                    name="debutPause"
                    type="time"
                    defaultValue={initialData?.debutPause || ""}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="finPause" className="block text-xs text-muted mb-1">
                    Fin pause
                  </label>
                  <input
                    id="finPause"
                    name="finPause"
                    type="time"
                    defaultValue={initialData?.finPause || ""}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sélection du format */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Sélection du format *
          </h2>
          <p className="text-muted text-sm mb-5">
            {formatDisabled
              ? "Le format ne peut pas être modifié car des participants sont déjà inscrits."
              : "Cliquez sur une carte pour sélectionner le format de votre événement."}
          </p>

          <div className="space-y-3">
            {formats.map((format) => (
              <button
                key={format.id}
                type="button"
                disabled={formatDisabled}
                onClick={() => setSelectedFormat(format.id)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  formatDisabled ? "opacity-60 cursor-not-allowed" : "hover:shadow-sm"
                } ${
                  selectedFormat === format.id ? format.activeColor : format.color
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-surface text-sm font-bold text-primary">
                    {format.icon}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {format.label}
                    </p>
                    <p className="text-xs text-muted">{format.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className={`mt-8 pt-6 border-t border-border ${isEdit ? "flex gap-3" : ""}`}>
            {isEdit && cancelHref && (
              <a
                href={cancelHref}
                className="flex-1 py-3 px-4 rounded-lg border border-border text-center text-foreground font-medium text-sm hover:bg-surface-hover transition-colors"
              >
                Annuler
              </a>
            )}
            <button
              type="submit"
              disabled={submitting}
              className={`${isEdit ? "flex-1" : "w-full"} py-3 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {submitting ? submittingLabel : submitLabel}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
