"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ShareLink from "@/components/evenement/ShareLink";
import AlgoStats from "@/components/evenement/AlgoStats";
import ParticipantTable from "@/components/evenement/ParticipantTable";
import AddParticipantForm from "@/components/evenement/AddParticipantForm";
import CSVImporter from "@/components/evenement/CSVImporter";
import ExportMenu from "@/components/evenement/ExportMenu";
import DeleteEventModal from "@/components/evenement/DeleteEventModal";
import ExposantManager from "@/components/evenement/ExposantManager";
import TeamManager from "@/components/evenement/TeamManager";

interface ParticipantRow {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  numero: number | null;
  present: boolean;
}

interface TourRow {
  id: string;
  numero: number;
  status: string;
}

interface EvenementDetail {
  id: string;
  titre: string;
  description: string | null;
  format: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  tempsParoleTour: number;
  tempsPauseTour: number;
  status: string;
  participants: ParticipantRow[];
  tours: TourRow[];
  _count: { participants: number };
}

const formatLabels: Record<string, string> = {
  speed_meeting: "Speed meeting",
  team: "Team",
  job_dating: "Job dating",
};

export default function EvenementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [evt, setEvt] = useState<EvenementDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchEvent = useCallback(() => {
    fetch(`/api/evenements/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setEvt(data);
        setLoading(false);
      })
      .catch(() => {
        router.push("/evenements");
      });
  }, [id, router]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  if (loading) {
    return <div className="text-center text-muted py-20">Chargement…</div>;
  }

  if (!evt) return null;

  const nbParticipants = evt.participants.length;
  const nbPresents = evt.participants.filter((p) => p.present).length;
  const hasTours = evt.tours && evt.tours.length > 0;
  const nbTables = nbParticipants > 0 ? Math.ceil(nbParticipants / (evt.format === "speed_meeting" ? 2 : 6)) : 0;
  const tempsTourMin = Math.floor(evt.tempsParoleTour / 60);
  const tempsTourSec = evt.tempsParoleTour % 60;

  async function handleStatusChange(newStatus: string) {
    await fetch(`/api/evenements/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchEvent();
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/evenements"
          className="p-2 rounded-lg hover:bg-surface-hover transition-colors text-muted hover:text-foreground"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{evt.titre}</h1>
          <p className="text-muted text-sm mt-1">
            {formatLabels[evt.format] || evt.format} ·{" "}
            {new Date(evt.date).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex gap-3">
          {(evt.status === "brouillon" || evt.status === "ouvert") && (
            <Link
              href={`/evenements/${evt.id}/modifier`}
              className="py-2.5 px-5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-surface-hover transition-colors"
            >
              Modifier
            </Link>
          )}
          {evt.status === "brouillon" && (
            <button
              onClick={() => handleStatusChange("ouvert")}
              className="py-2.5 px-5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-surface-hover transition-colors"
            >
              Ouvrir les inscriptions
            </button>
          )}
          {(evt.status === "ouvert" || evt.status === "brouillon") && nbParticipants >= 2 && (
            <Link
              href={`/${evt.id}/tours`}
              className="py-2.5 px-5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors"
            >
              Lancer l&apos;événement
            </Link>
          )}
          {evt.status === "en_cours" && (
            <Link
              href={`/${evt.id}/tours`}
              className="py-2.5 px-5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors"
            >
              Reprendre
            </Link>
          )}
        </div>
      </div>

      {/* Share inscription link */}
      <ShareLink eventId={evt.id} isOpen={evt.status === "ouvert"} />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface rounded-xl border border-border p-6">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Participants</p>
          <p className="text-3xl font-bold text-foreground">{nbParticipants}</p>
          {nbPresents > 0 && (
            <p className="text-sm text-success mt-1">{nbPresents} présents</p>
          )}
        </div>
        <div className="bg-surface rounded-xl border border-border p-6">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Tables estimées</p>
          <p className="text-3xl font-bold text-foreground">{nbTables}</p>
          <p className="text-sm text-muted mt-1">
            {evt.format === "speed_meeting" ? "2" : "6"} participants / table
          </p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-6">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Temps de parole</p>
          <p className="text-3xl font-bold text-foreground">
            {tempsTourMin > 0 ? `${tempsTourMin}m` : ""}{tempsTourSec > 0 ? `${tempsTourSec}s` : ""}
            {tempsTourMin === 0 && tempsTourSec === 0 ? "0s" : ""}
          </p>
          <p className="text-sm text-muted mt-1">
            {evt.heureDebut} — {evt.heureFin}
          </p>
        </div>
      </div>

      {/* Algorithm stats (speed_meeting only) */}
      {evt.format === "speed_meeting" && (
        <AlgoStats eventId={id} hasTours={hasTours} />
      )}

      {/* Job Dating: Exposant manager */}
      {evt.format === "job_dating" && (
        <div className="mb-8">
          <ExposantManager
            eventId={id}
            heureDebut={evt.heureDebut}
            heureFin={evt.heureFin}
            tempsParoleTour={evt.tempsParoleTour}
            tempsPauseTour={evt.tempsPauseTour}
          />
        </div>
      )}

      {/* Team: Team manager */}
      {evt.format === "team" && (
        <div className="mb-8">
          <TeamManager eventId={id} nbParticipants={nbParticipants} />
        </div>
      )}

      {/* Participants section */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-foreground">
            Participants ({nbParticipants})
          </h2>
          <div className="flex gap-2">
            <ExportMenu eventId={id} hasTours={hasTours} />
            <CSVImporter eventId={id} onImported={fetchEvent} />
            <AddParticipantForm eventId={id} onAdded={fetchEvent} />
          </div>
        </div>

        <ParticipantTable
          participants={evt.participants}
          eventId={id}
          onUpdate={fetchEvent}
        />
      </div>

      {/* Danger zone */}
      <div className="mt-10 bg-surface rounded-xl border border-danger/20 p-6">
        <h2 className="text-lg font-semibold text-danger mb-2">Zone de danger</h2>
        <p className="text-sm text-muted mb-4">
          La suppression de cet événement est irréversible. Toutes les données associées (participants, tours, tables) seront définitivement supprimées.
        </p>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="py-2.5 px-5 rounded-lg border border-danger text-danger text-sm font-medium hover:bg-danger hover:text-white transition-colors"
        >
          Supprimer cet événement
        </button>
      </div>

      {/* Delete confirmation modal */}
      <DeleteEventModal
        eventId={id}
        eventTitle={evt.titre}
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
