"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";

interface Creneau {
  id: string;
  heureDebut: string;
  heureFin: string;
  maxParticipants: number;
  _count: { inscriptions: number };
}

interface Exposant {
  id: string;
  societe: { id: string; nom: string; adresse: string | null };
  creneaux: Creneau[];
}

interface ExposantManagerProps {
  eventId: string;
  heureDebut: string;
  heureFin: string;
  tempsParoleTour: number;
  tempsPauseTour: number;
}

export default function ExposantManager({
  eventId,
  heureDebut,
  heureFin,
  tempsParoleTour,
  tempsPauseTour,
}: ExposantManagerProps) {
  const [exposants, setExposants] = useState<Exposant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);

  const fetchExposants = useCallback(async () => {
    try {
      const res = await fetch(`/api/evenements/${eventId}/exposants`);
      if (res.ok) {
        const data = await res.json();
        setExposants(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchExposants();
  }, [fetchExposants]);

  async function handleAddExposant(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const formData = new FormData(form);

    const body = {
      nom: formData.get("nom") as string,
      entreprise: formData.get("entreprise") as string || undefined,
      description: formData.get("description") as string || undefined,
    };

    if (!body.nom) {
      setError("Le nom est requis.");
      return;
    }

    const res = await fetch(`/api/evenements/${eventId}/exposants`, {
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
    setShowAddForm(false);
    setError("");
    fetchExposants();
  }

  async function handleDeleteExposant(exposantId: string) {
    const res = await fetch(
      `/api/evenements/${eventId}/exposants?exposantId=${exposantId}`,
      { method: "DELETE" }
    );
    if (res.ok) {
      fetchExposants();
    }
  }

  async function handleGenerateCreneaux(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGenerating(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const capacite = parseInt(formData.get("capacite") as string) || 1;

    const res = await fetch(`/api/evenements/${eventId}/creneaux`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        heureDebut,
        heureFin,
        dureeTour: tempsParoleTour,
        dureePause: tempsPauseTour,
        capacite,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erreur lors de la génération.");
    } else {
      setShowGenerateModal(false);
    }

    setGenerating(false);
    fetchExposants();
  }

  async function handleDeleteCreneau(creneauId: string) {
    const res = await fetch(
      `/api/evenements/${eventId}/creneaux?creneauId=${creneauId}`,
      { method: "DELETE" }
    );
    if (res.ok) {
      fetchExposants();
    }
  }

  const totalCreneaux = exposants.reduce((sum, e) => sum + e.creneaux.length, 0);
  const totalInscriptions = exposants.reduce(
    (sum, e) => sum + e.creneaux.reduce((s, c) => s + c._count.inscriptions, 0),
    0
  );

  if (loading) {
    return <div className="text-center text-muted py-8">Chargement des exposants...</div>;
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Exposants ({exposants.length})
            </h2>
            <p className="text-sm text-muted mt-0.5">
              {totalCreneaux} créneaux &middot; {totalInscriptions} inscriptions
            </p>
          </div>
          <div className="flex gap-2">
            {exposants.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGenerateModal(true)}
              >
                Générer les créneaux
              </Button>
            )}
            <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
              Ajouter un exposant
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
            {error}
          </div>
        )}

        {/* Formulaire d'ajout */}
        {showAddForm && (
          <form onSubmit={handleAddExposant} className="mb-6 p-4 rounded-lg border border-border bg-background">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <Input name="nom" placeholder="Nom de l'exposant *" required />
              <Input name="entreprise" placeholder="Entreprise (optionnel)" />
              <Input name="description" placeholder="Description (optionnel)" />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm">
                Ajouter
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => { setShowAddForm(false); setError(""); }}
              >
                Annuler
              </Button>
            </div>
          </form>
        )}

        {/* Liste des exposants */}
        {exposants.length === 0 ? (
          <p className="text-muted text-sm py-4 text-center">
            Aucun exposant pour le moment. Ajoutez des exposants pour commencer.
          </p>
        ) : (
          <div className="space-y-4">
            {exposants.map((exposant) => (
              <div
                key={exposant.id}
                className="p-4 rounded-lg border border-border bg-background"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      {exposant.societe.nom}
                    </span>
                    <Badge variant="primary">
                      {exposant.creneaux.length} créneaux
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteExposant(exposant.id)}
                    className="text-danger hover:text-danger"
                  >
                    Supprimer
                  </Button>
                </div>

                {exposant.societe.adresse && (
                  <p className="text-sm text-muted mb-2">{exposant.societe.adresse}</p>
                )}

                {/* Créneaux de l'exposant */}
                {exposant.creneaux.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {exposant.creneaux.map((creneau) => (
                      <div
                        key={creneau.id}
                        className="relative group flex flex-col items-center p-2 rounded-md border border-border bg-surface text-xs"
                      >
                        <span className="font-medium text-foreground">
                          {creneau.heureDebut} - {creneau.heureFin}
                        </span>
                        <span className="text-muted">
                          {creneau._count.inscriptions}/{creneau.maxParticipants}
                        </span>
                        <button
                          onClick={() => handleDeleteCreneau(creneau.id)}
                          className="absolute -top-1.5 -right-1.5 hidden group-hover:flex items-center justify-center w-5 h-5 rounded-full bg-danger text-white text-xs"
                          title="Supprimer ce créneau"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal de génération de créneaux */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Générer les créneaux automatiquement"
      >
        <form onSubmit={handleGenerateCreneaux} className="space-y-4">
          <p className="text-sm text-muted">
            Les créneaux seront générés pour tous les exposants en fonction des
            horaires de l&apos;événement ({heureDebut} - {heureFin}) et des
            durées configurées ({Math.floor(tempsParoleTour / 60)}min parole,{" "}
            {Math.floor(tempsPauseTour / 60)}min pause).
          </p>
          <p className="text-sm text-warning">
            Attention : les créneaux existants seront remplacés.
          </p>
          <Input
            name="capacite"
            label="Capacité par créneau"
            type="number"
            min={1}
            max={100}
            defaultValue={1}
          />
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowGenerateModal(false)}
            >
              Annuler
            </Button>
            <Button type="submit" loading={generating}>
              Générer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
