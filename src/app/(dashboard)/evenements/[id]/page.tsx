"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

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

interface TourTable {
  tableId: string;
  numero: number;
  participants: { id: string; nom: string; prenom: string; numero: number | null }[];
}

interface TourStatsData {
  id: string;
  numero: number;
  status: string;
  tables: TourTable[];
}

interface ToursResponse {
  tours: TourStatsData[];
  totalParticipants: number;
  totalTables: number;
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
  const [showAddForm, setShowAddForm] = useState(false);
  const [addError, setAddError] = useState("");
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const [hasTours, setHasTours] = useState(false);

  // Share link
  const [linkCopied, setLinkCopied] = useState(false);

  // Algorithm stats
  const [toursStats, setToursStats] = useState<ToursResponse | null>(null);

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchEvent = useCallback(() => {
    fetch(`/api/evenements/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setEvt(data);
        setHasTours(data.tours && data.tours.length > 0);
        setLoading(false);
      })
      .catch(() => {
        router.push("/evenements");
      });
  }, [id, router]);

  const fetchToursStats = useCallback(() => {
    fetch(`/api/evenements/${id}/tours`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: ToursResponse) => {
        setToursStats(data);
      })
      .catch(() => {
        setToursStats(null);
      });
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  useEffect(() => {
    if (hasTours) {
      fetchToursStats();
    }
  }, [hasTours, fetchToursStats]);

  async function handleCopyLink() {
    if (!evt) return;
    const link = `${window.location.origin}/${evt.id}/inscription`;
    try {
      await navigator.clipboard.writeText(link);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = link;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  }

  async function handleAddParticipant(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAddError("");
    const form = e.currentTarget;
    const formData = new FormData(form);

    const body = {
      nom: formData.get("nom"),
      prenom: formData.get("prenom"),
      email: formData.get("email"),
      telephone: formData.get("telephone") || null,
    };

    if (!body.nom || !body.prenom || !body.email) {
      setAddError("Nom, prénom et email sont requis.");
      return;
    }

    const res = await fetch(`/api/evenements/${id}/participants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setAddError(data.error || "Erreur lors de l'ajout.");
      return;
    }

    form.reset();
    setShowAddForm(false);
    fetchEvent();
  }

  async function handleCSVImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split("\n").filter((l) => l.trim());

    if (lines.length < 2) {
      setAddError("Le fichier CSV doit contenir au moins un en-tête et une ligne de données.");
      return;
    }

    // Parse header
    const separator = lines[0].includes(";") ? ";" : ",";
    const headers = lines[0].split(separator).map((h) => h.trim().toLowerCase().replace(/"/g, ""));

    const nomIdx = headers.findIndex((h) => h === "nom");
    const prenomIdx = headers.findIndex((h) => h === "prenom" || h === "prénom");
    const emailIdx = headers.findIndex((h) => h === "email" || h === "e-mail" || h === "mail");
    const telIdx = headers.findIndex((h) => h === "telephone" || h === "téléphone" || h === "tel");

    if (nomIdx === -1 || prenomIdx === -1 || emailIdx === -1) {
      setAddError('Colonnes requises dans le CSV : "nom", "prenom", "email". Optionnel : "telephone".');
      return;
    }

    const participants = lines.slice(1).map((line) => {
      const cols = line.split(separator).map((c) => c.trim().replace(/"/g, ""));
      return {
        nom: cols[nomIdx] || "",
        prenom: cols[prenomIdx] || "",
        email: cols[emailIdx] || "",
        telephone: telIdx !== -1 ? cols[telIdx] || null : null,
      };
    }).filter((p) => p.nom && p.prenom && p.email);

    if (participants.length === 0) {
      setAddError("Aucun participant valide trouvé dans le CSV.");
      return;
    }

    const res = await fetch(`/api/evenements/${id}/participants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(participants),
    });

    const data = await res.json();

    if (res.ok) {
      setAddError("");
      if (data.skipped > 0) {
        setAddError(`${data.created} ajoutés, ${data.skipped} doublons ignorés.`);
      }
      fetchEvent();
    } else {
      setAddError(data.error || "Erreur lors de l'import.");
    }

    // Reset input
    if (csvInputRef.current) csvInputRef.current.value = "";
  }

  async function handleDeleteParticipant(participantId: string) {
    await fetch(`/api/evenements/${id}/participants`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId }),
    });
    fetchEvent();
  }

  async function handleTogglePresence(participantId: string, currentPresent: boolean) {
    await fetch(`/api/evenements/${id}/participants`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId, present: !currentPresent }),
    });
    fetchEvent();
  }

  async function handleStatusChange(newStatus: string) {
    await fetch(`/api/evenements/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchEvent();
  }

  async function handleDeleteEvent() {
    setDeleting(true);
    const res = await fetch(`/api/evenements/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.push("/evenements");
    } else {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  // Close export menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    }
    if (showExportMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showExportMenu]);

  function handleExport(type: string) {
    setShowExportMenu(false);
    window.open(`/api/evenements/${id}/export?type=${type}`, "_blank");
  }

  if (loading) {
    return <div className="text-center text-muted py-20">Chargement…</div>;
  }

  if (!evt) return null;

  const nbParticipants = evt.participants.length;
  const nbPresents = evt.participants.filter((p) => p.present).length;
  const nbTables = nbParticipants > 0 ? Math.ceil(nbParticipants / (evt.format === "speed_meeting" ? 2 : 6)) : 0;
  const tempsTourMin = Math.floor(evt.tempsParoleTour / 60);
  const tempsTourSec = evt.tempsParoleTour % 60;

  // Algorithm stats computation
  const statsNbTours = toursStats?.tours.length ?? 0;
  const statsTotalTables = toursStats?.totalTables ?? 0;
  const statsTotalParticipants = toursStats?.totalParticipants ?? 0;
  const maxPossibleMeetings = statsTotalParticipants > 1
    ? (statsTotalParticipants * (statsTotalParticipants - 1)) / 2
    : 0;
  const uniquePairsSet = new Set<string>();
  if (toursStats) {
    for (const tour of toursStats.tours) {
      for (const table of tour.tables) {
        const pIds = table.participants.map((p) => p.id).sort();
        for (let i = 0; i < pIds.length; i++) {
          for (let j = i + 1; j < pIds.length; j++) {
            uniquePairsSet.add(`${pIds[i]}-${pIds[j]}`);
          }
        }
      }
    }
  }
  const uniqueMeetings = uniquePairsSet.size;
  const coverageRate = maxPossibleMeetings > 0
    ? Math.round((uniqueMeetings / maxPossibleMeetings) * 100)
    : 0;

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
      {evt.status === "ouvert" && (
        <div className="bg-surface rounded-xl border border-border p-5 mb-8">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m9.86-2.54a4.5 4.5 0 0 0-1.242-7.244l4.5-4.5a4.5 4.5 0 0 1 6.364 6.364l-1.757 1.757" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground mb-1">Lien d&apos;inscription public</p>
              <p className="text-xs text-muted truncate font-mono">
                {typeof window !== "undefined" ? `${window.location.origin}/${evt.id}/inscription` : `/${evt.id}/inscription`}
              </p>
            </div>
            <button
              onClick={handleCopyLink}
              className="flex-shrink-0 py-2 px-4 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-surface-hover transition-colors flex items-center gap-2"
            >
              {linkCopied ? (
                <>
                  <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span className="text-success">Copié !</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                  </svg>
                  Copier le lien
                </>
              )}
            </button>
          </div>
        </div>
      )}

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

      {/* Algorithm stats preview */}
      {toursStats && toursStats.tours.length > 0 && (
        <div className="bg-surface rounded-xl border border-border p-6 mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Statistiques de l&apos;algorithme</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-background border border-border">
              <p className="text-xs text-muted uppercase tracking-wider mb-1">Tours</p>
              <p className="text-2xl font-bold text-foreground">{statsNbTours}</p>
            </div>
            <div className="p-4 rounded-lg bg-background border border-border">
              <p className="text-xs text-muted uppercase tracking-wider mb-1">Tables</p>
              <p className="text-2xl font-bold text-foreground">{statsTotalTables}</p>
            </div>
            <div className="p-4 rounded-lg bg-background border border-border">
              <p className="text-xs text-muted uppercase tracking-wider mb-1">Rencontres uniques</p>
              <p className="text-2xl font-bold text-foreground">{uniqueMeetings}</p>
              <p className="text-xs text-muted mt-0.5">sur {maxPossibleMeetings} possibles</p>
            </div>
            <div className="p-4 rounded-lg bg-background border border-border">
              <p className="text-xs text-muted uppercase tracking-wider mb-1">Couverture</p>
              <p className="text-2xl font-bold text-foreground">{coverageRate}%</p>
              <div className="mt-2 h-1.5 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${coverageRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Participants */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-foreground">
            Participants ({nbParticipants})
          </h2>
          <div className="flex gap-2">
            {/* Export dropdown */}
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 py-2 px-4 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-surface-hover transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12M12 16.5V3" />
                </svg>
                Exporter
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-1 w-56 rounded-lg border border-border bg-surface shadow-lg z-10">
                  <button
                    onClick={() => handleExport("participants")}
                    className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-surface-hover transition-colors rounded-t-lg"
                  >
                    Participants (CSV)
                  </button>
                  <button
                    onClick={() => handleExport("resultats")}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      hasTours
                        ? "text-foreground hover:bg-surface-hover"
                        : "text-muted/40 cursor-not-allowed"
                    }`}
                    disabled={!hasTours}
                  >
                    Résultats par tour (CSV)
                  </button>
                  <button
                    onClick={() => handleExport("rencontres")}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors rounded-b-lg ${
                      hasTours
                        ? "text-foreground hover:bg-surface-hover"
                        : "text-muted/40 cursor-not-allowed"
                    }`}
                    disabled={!hasTours}
                  >
                    Rencontres (CSV)
                  </button>
                </div>
              )}
            </div>
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleCSVImport}
            />
            <button
              onClick={() => csvInputRef.current?.click()}
              className="flex items-center gap-2 py-2 px-4 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-surface-hover transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
              Import CSV
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 py-2 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Ajouter
            </button>
          </div>
        </div>

        {addError && (
          <div className="mb-4 p-3 rounded-lg bg-warning/10 border border-warning/20 text-warning text-sm">
            {addError}
          </div>
        )}

        {/* Formulaire d'ajout */}
        {showAddForm && (
          <form onSubmit={handleAddParticipant} className="mb-6 p-4 rounded-lg border border-border bg-background">
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
                onClick={() => { setShowAddForm(false); setAddError(""); }}
                className="py-2 px-4 rounded-lg border border-border text-sm text-muted hover:bg-surface-hover transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        )}

        {/* Liste des participants */}
        {nbParticipants === 0 ? (
          <p className="text-sm text-muted text-center py-12">
            Les participants apparaîtront ici une fois ajoutés.
          </p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-2">N°</th>
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-2">Nom</th>
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-2">Prénom</th>
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-2">Email</th>
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-2">Tél.</th>
                <th className="text-center text-xs font-medium text-muted uppercase tracking-wider px-4 py-2">Présent</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {evt.participants.map((p) => (
                <tr key={p.id} className="hover:bg-surface-hover transition-colors">
                  <td className="px-4 py-2.5">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                      {p.numero}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-sm text-foreground font-medium">{p.nom}</td>
                  <td className="px-4 py-2.5 text-sm text-foreground">{p.prenom}</td>
                  <td className="px-4 py-2.5 text-sm text-muted">{p.email}</td>
                  <td className="px-4 py-2.5 text-sm text-muted">{p.telephone || "—"}</td>
                  <td className="px-4 py-2.5 text-center">
                    <button
                      onClick={() => handleTogglePresence(p.id, p.present)}
                      className={`w-5 h-5 rounded border-2 inline-flex items-center justify-center transition-colors ${
                        p.present
                          ? "bg-primary border-primary text-white"
                          : "border-border hover:border-primary/50"
                      }`}
                      title={p.present ? "Marquer absent" : "Marquer présent"}
                    >
                      {p.present && (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => handleDeleteParticipant(p.id)}
                      className="text-xs text-danger hover:text-danger/80 transition-colors"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Danger zone — Delete event */}
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
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !deleting && setShowDeleteConfirm(false)}
          />
          <div className="relative bg-surface rounded-xl border border-border p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground mb-2">Confirmer la suppression</h3>
            <p className="text-sm text-muted mb-6">
              Êtes-vous sûr de vouloir supprimer l&apos;événement <span className="font-medium text-foreground">{evt.titre}</span> ?
              Cette action est irréversible.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="py-2 px-4 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-surface-hover transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteEvent}
                disabled={deleting}
                className="py-2 px-4 rounded-lg bg-danger hover:bg-danger/90 text-white text-sm font-medium transition-colors disabled:opacity-50"
              >
                {deleting ? "Suppression..." : "Supprimer définitivement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
