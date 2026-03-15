"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";

interface TeamMember {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  numero: number | null;
}

interface Team {
  numero: number;
  membres: TeamMember[];
}

interface TeamManagerProps {
  eventId: string;
  nbParticipants: number;
}

export default function TeamManager({ eventId, nbParticipants }: TeamManagerProps) {
  const [equipes, setEquipes] = useState<Team[]>([]);
  const [sansEquipe, setSansEquipe] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [swapSource, setSwapSource] = useState<{ participantId: string; fromTeam: number } | null>(null);

  const fetchTeams = useCallback(async () => {
    try {
      const res = await fetch(`/api/evenements/${eventId}/equipes`);
      if (res.ok) {
        const data = await res.json();
        setEquipes(data.equipes);
        setSansEquipe(data.sansEquipe);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  async function handleGenerate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGenerating(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const nbEquipes = parseInt(formData.get("nbEquipes") as string);

    if (!nbEquipes || nbEquipes < 2) {
      setError("Il faut au moins 2 équipes.");
      setGenerating(false);
      return;
    }

    const res = await fetch(`/api/evenements/${eventId}/equipes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nbEquipes }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erreur lors de la génération.");
    } else {
      setShowGenerateModal(false);
    }

    setGenerating(false);
    fetchTeams();
  }

  async function handleClearTeams() {
    const res = await fetch(`/api/evenements/${eventId}/equipes`, {
      method: "DELETE",
    });
    if (res.ok) {
      fetchTeams();
    }
  }

  async function handleSwap(participantId: string, nouvelleEquipe: number) {
    const res = await fetch(`/api/evenements/${eventId}/equipes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "swap", participantId, nouvelleEquipe }),
    });
    if (res.ok) {
      setSwapSource(null);
      fetchTeams();
    }
  }

  // Calculer le nombre d'équipes suggéré
  const suggestedTeams = Math.max(2, Math.round(nbParticipants / 6));

  if (loading) {
    return <div className="text-center text-muted py-8">Chargement des équipes...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Équipes ({equipes.length})
            </h2>
            {equipes.length > 0 && (
              <p className="text-sm text-muted mt-0.5">
                {equipes.reduce((sum, e) => sum + e.membres.length, 0)} participants répartis
                {sansEquipe.length > 0 && ` · ${sansEquipe.length} sans équipe`}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {equipes.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleClearTeams}>
                Réinitialiser
              </Button>
            )}
            <Button size="sm" onClick={() => setShowGenerateModal(true)}>
              {equipes.length > 0 ? "Regénérer" : "Générer les équipes"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
            {error}
          </div>
        )}

        {equipes.length === 0 ? (
          <p className="text-muted text-sm py-4 text-center">
            Aucune équipe pour le moment. Générez les équipes pour répartir les {nbParticipants} participants.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipes.map((equipe) => (
              <div
                key={equipe.numero}
                className="p-4 rounded-lg border border-border bg-background"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-bold">
                      {equipe.numero}
                    </span>
                    <span className="font-medium text-foreground">
                      Équipe {equipe.numero}
                    </span>
                  </div>
                  <Badge variant="primary">{equipe.membres.length} membres</Badge>
                </div>

                <ul className="space-y-1.5">
                  {equipe.membres.map((membre) => (
                    <li
                      key={membre.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-foreground">
                        {membre.prenom} {membre.nom}
                      </span>
                      {swapSource && swapSource.participantId !== membre.id ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSwap(swapSource.participantId, equipe.numero)}
                          className="text-xs text-primary"
                        >
                          Placer ici
                        </Button>
                      ) : (
                        <button
                          onClick={() =>
                            setSwapSource(
                              swapSource?.participantId === membre.id
                                ? null
                                : { participantId: membre.id, fromTeam: equipe.numero }
                            )
                          }
                          className={`text-xs px-2 py-0.5 rounded transition-colors ${
                            swapSource?.participantId === membre.id
                              ? "bg-warning/20 text-warning"
                              : "text-muted hover:text-foreground hover:bg-surface-hover"
                          }`}
                          title="Déplacer ce membre vers une autre équipe"
                        >
                          {swapSource?.participantId === membre.id ? "Annuler" : "Déplacer"}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Participants sans équipe */}
        {sansEquipe.length > 0 && equipes.length > 0 && (
          <div className="mt-6 p-4 rounded-lg border border-warning/20 bg-warning/5">
            <h3 className="text-sm font-medium text-warning mb-2">
              Participants sans équipe ({sansEquipe.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {sansEquipe.map((p) => (
                <span
                  key={p.id}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-surface border border-border text-xs text-foreground"
                >
                  {p.prenom} {p.nom}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Modal de génération */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Générer les équipes"
      >
        <form onSubmit={handleGenerate} className="space-y-4">
          <p className="text-sm text-muted">
            Les {nbParticipants} participants seront répartis aléatoirement
            en équipes de taille équilibrée.
          </p>
          {equipes.length > 0 && (
            <p className="text-sm text-warning">
              Attention : les équipes existantes seront remplacées.
            </p>
          )}
          <Input
            name="nbEquipes"
            label="Nombre d'équipes"
            type="number"
            min={2}
            max={Math.min(50, nbParticipants)}
            defaultValue={suggestedTeams}
            required
          />
          <p className="text-xs text-muted">
            Suggestion : {suggestedTeams} équipes de ~{Math.ceil(nbParticipants / suggestedTeams)} personnes
          </p>
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
