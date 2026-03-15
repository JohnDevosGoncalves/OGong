"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// ─── Types ──────────────────────────────────────────────────

interface ParticipantInfo {
  id: string;
  nom: string;
  prenom: string;
  numero: number | null;
}

interface TableInfo {
  tableId: string;
  numero: number;
  participants: ParticipantInfo[];
}

interface TourInfo {
  id: string;
  numero: number;
  status: string;
  tables: TableInfo[];
}

interface ToursData {
  evenement: {
    id: string;
    titre: string;
    format: string;
    tempsParoleTour: number;
    tempsPauseTour: number;
    status: string;
  };
  tours: TourInfo[];
  totalParticipants: number;
  totalTables: number;
}

// ─── Helpers ────────────────────────────────────────────────

function calculateUniqueMeetings(tours: TourInfo[]): number {
  const meetingSet = new Set<string>();
  for (const tour of tours) {
    for (const table of tour.tables) {
      const participantIds = table.participants.map((p) => p.id).sort();
      // Each pair of participants at the same table is a unique meeting
      for (let i = 0; i < participantIds.length; i++) {
        for (let j = i + 1; j < participantIds.length; j++) {
          meetingSet.add(`${participantIds[i]}-${participantIds[j]}`);
        }
      }
    }
  }
  return meetingSet.size;
}

// ─── Composant Principal ────────────────────────────────────

export default function ToursPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [data, setData] = useState<ToursData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentTourIndex, setCurrentTourIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPause, setIsPause] = useState(false);
  const [showTimeUp, setShowTimeUp] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  // ─── Fetch des tours ────────────────────────────────────

  const fetchTours = useCallback(async () => {
    try {
      const res = await fetch(`/api/evenements/${id}/tours`);
      if (!res.ok) throw new Error();
      const toursData: ToursData = await res.json();
      setData(toursData);

      // Si pas de tours encore, les générer
      if (toursData.tours.length === 0) {
        setGenerating(true);
        const genRes = await fetch(`/api/evenements/${id}/tours`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        if (genRes.ok) {
          // Re-fetch après génération
          const res2 = await fetch(`/api/evenements/${id}/tours`);
          if (res2.ok) {
            const newData = await res2.json();
            setData(newData);
          }
        }
        setGenerating(false);
      }

      // Trouver le tour en cours
      const enCoursIdx = toursData.tours.findIndex((t) => t.status === "en_cours");
      if (enCoursIdx >= 0) {
        setCurrentTourIndex(enCoursIdx);
      } else {
        // Trouver le premier tour en_attente
        const attenteIdx = toursData.tours.findIndex((t) => t.status === "en_attente");
        if (attenteIdx >= 0) setCurrentTourIndex(attenteIdx);
      }
    } catch {
      router.push("/evenements");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  // ─── Timer ──────────────────────────────────────────────

  const totalTime = data
    ? isPause
      ? data.evenement.tempsPauseTour
      : data.evenement.tempsParoleTour
    : 0;

  useEffect(() => {
    if (isRunning && timerSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            // Timer terminé
            clearInterval(intervalRef.current!);
            setIsRunning(false);

            // Afficher "Temps écoulé !" brièvement
            setShowTimeUp(true);
            setTimeout(() => setShowTimeUp(false), 2500);

            // Jouer un son (optionnel, via Web Audio)
            try {
              const ctx = new AudioContext();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.frequency.value = 800;
              gain.gain.value = 0.3;
              osc.start();
              osc.stop(ctx.currentTime + 0.5);
            } catch {
              // Audio non supporté
            }

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timerSeconds]);

  // ─── Keyboard shortcuts ───────────────────────────────

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        if (isRunning) {
          pauseTimer();
        } else if (timerSeconds > 0) {
          startTimer();
        } else if (totalTime > 0) {
          setTimerSeconds(totalTime);
          setIsRunning(true);
        }
      }

      if (e.code === "Enter" && data) {
        e.preventDefault();
        const currentTour = data.tours[currentTourIndex];
        if (currentTour?.status === "en_cours" && !isPause) {
          finishTour();
        }
      }

      if (e.code === "KeyR" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        resetTimer();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, timerSeconds, totalTime, currentTourIndex, isPause, data]);

  // ─── Fullscreen ───────────────────────────────────────

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      pageRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  // ─── Actions ────────────────────────────────────────────

  function startTimer() {
    if (timerSeconds === 0) {
      setTimerSeconds(totalTime);
    }
    setIsRunning(true);
  }

  function pauseTimer() {
    setIsRunning(false);
  }

  function resetTimer() {
    setIsRunning(false);
    setTimerSeconds(totalTime);
  }

  async function startTour() {
    if (!data) return;
    const tour = data.tours[currentTourIndex];
    if (!tour) return;

    await fetch(`/api/evenements/${id}/tours`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tourId: tour.id, status: "en_cours" }),
    });

    setIsPause(false);
    setTimerSeconds(data.evenement.tempsParoleTour);
    setIsRunning(true);

    // Mettre à jour localement
    setData((prev) => {
      if (!prev) return prev;
      const tours = [...prev.tours];
      tours[currentTourIndex] = { ...tours[currentTourIndex], status: "en_cours" };
      return { ...prev, tours };
    });
  }

  async function finishTour() {
    if (!data) return;
    const tour = data.tours[currentTourIndex];
    if (!tour) return;

    setIsRunning(false);

    await fetch(`/api/evenements/${id}/tours`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tourId: tour.id, status: "termine" }),
    });

    // Mettre à jour localement
    setData((prev) => {
      if (!prev) return prev;
      const tours = [...prev.tours];
      tours[currentTourIndex] = { ...tours[currentTourIndex], status: "termine" };
      return { ...prev, tours };
    });

    // Passer au tour suivant s'il existe
    if (currentTourIndex < data.tours.length - 1) {
      setCurrentTourIndex(currentTourIndex + 1);
      setIsPause(true);
      setTimerSeconds(data.evenement.tempsPauseTour);
    }
  }

  async function finishEvent() {
    await fetch(`/api/evenements/${id}/tours`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ terminerEvenement: true }),
    });
    setShowSummary(true);
  }

  // ─── Affichage ──────────────────────────────────────────

  if (loading || generating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted">
            {generating ? "Calcul des tables en cours\u2026" : "Chargement\u2026"}
          </p>
        </div>
      </div>
    );
  }

  if (!data || data.tours.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted mb-4">Aucun tour g\u00e9n\u00e9r\u00e9.</p>
        <Link href={`/evenements/${id}`} className="text-primary hover:underline">
          Retour \u00e0 l&apos;\u00e9v\u00e9nement
        </Link>
      </div>
    );
  }

  // ─── Summary screen ────────────────────────────────────

  if (showSummary) {
    const uniqueMeetings = calculateUniqueMeetings(data.tours);
    const completedTours = data.tours.filter((t) => t.status === "termine").length;

    return (
      <div
        ref={pageRef}
        className="flex items-center justify-center min-h-screen p-6 bg-background"
      >
        <div className="bg-surface rounded-2xl border border-border p-8 md:p-12 max-w-lg w-full text-center">
          {/* Confetti-style icon */}
          <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            F\u00e9licitations !
          </h1>
          <p className="text-muted mb-8">
            L&apos;\u00e9v\u00e9nement &laquo;&nbsp;{data.evenement.titre}&nbsp;&raquo; est termin\u00e9.
          </p>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-background rounded-xl p-4">
              <p className="text-2xl font-bold text-primary tabular-nums">
                {data.totalParticipants}
              </p>
              <p className="text-xs text-muted mt-1">Participants</p>
            </div>
            <div className="bg-background rounded-xl p-4">
              <p className="text-2xl font-bold text-success tabular-nums">
                {completedTours}
              </p>
              <p className="text-xs text-muted mt-1">Tours compl\u00e9t\u00e9s</p>
            </div>
            <div className="bg-background rounded-xl p-4">
              <p className="text-2xl font-bold text-accent tabular-nums">
                {uniqueMeetings}
              </p>
              <p className="text-xs text-muted mt-1">Rencontres uniques</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <Link
              href={`/evenements/${id}`}
              className="py-3 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white font-medium transition-colors text-center"
            >
              Retour \u00e0 l&apos;\u00e9v\u00e9nement
            </Link>
            <a
              href={`/api/evenements/${id}/export?type=resultats`}
              className="py-3 px-6 rounded-xl border border-border text-foreground font-medium hover:bg-surface-hover transition-colors text-center inline-flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Exporter les r\u00e9sultats
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main page ─────────────────────────────────────────

  const currentTour = data.tours[currentTourIndex];
  const progress = totalTime > 0 ? ((totalTime - timerSeconds) / totalTime) : 0;
  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const timeDisplay = `${minutes}:${String(seconds).padStart(2, "0")}`;

  const isLastTour = currentTourIndex === data.tours.length - 1;
  const allToursTerminated = data.tours.every((t) => t.status === "termine");
  const isLastSeconds = timerSeconds > 0 && timerSeconds <= 10 && isRunning;

  return (
    <div ref={pageRef} className="p-4 lg:p-8 min-h-screen bg-background">
      {/* Pulsing animation style */}
      <style>{`
        @keyframes pulse-danger {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .animate-pulse-danger {
          animation: pulse-danger 0.8s ease-in-out infinite;
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out;
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 lg:mb-6 gap-2 flex-wrap">
        <div className="flex items-center gap-3 lg:gap-4 min-w-0">
          <Link
            href={`/evenements/${id}`}
            className="p-2 rounded-lg hover:bg-surface-hover transition-colors text-muted hover:text-foreground shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg lg:text-xl font-bold text-foreground truncate">{data.evenement.titre}</h1>
            <p className="text-xs lg:text-sm text-muted">
              {data.totalParticipants} participants · {data.totalTables} tables · {data.tours.length} tours
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-lg border border-border text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
            title={isFullscreen ? "Quitter le plein \u00e9cran" : "Plein \u00e9cran"}
          >
            {isFullscreen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
            )}
          </button>

          {allToursTerminated && (
            <button
              onClick={finishEvent}
              className="py-2 lg:py-2.5 px-4 lg:px-5 rounded-lg bg-success hover:bg-success/90 text-white text-sm font-medium transition-colors"
            >
              Terminer l&apos;\u00e9v\u00e9nement
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-8">
        {/* Timer central */}
        <div className="bg-surface rounded-2xl border border-border p-6 lg:p-8 flex flex-col items-center justify-center sticky top-4 z-10 lg:static">
          {/* "Temps écoulé !" overlay */}
          {showTimeUp && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface/90 rounded-2xl z-20 animate-fade-in-up">
              <p className="text-3xl lg:text-4xl font-bold text-danger">
                Temps \u00e9coul\u00e9 !
              </p>
            </div>
          )}

          {/* Status */}
          <p className="text-xl lg:text-2xl font-bold text-foreground mb-2 text-center">
            {isPause
              ? "Pause \u2014 Changez de table !"
              : currentTour.status === "en_cours"
              ? "C\u2019est \u00e0 vous !"
              : currentTour.status === "termine"
              ? "Tour termin\u00e9"
              : "Pr\u00eat \u00e0 lancer"}
          </p>

          {/* Indicateurs de tour */}
          <div className="flex items-center gap-2 mb-2 mt-4 flex-wrap justify-center">
            {data.tours.map((tour, idx) => (
              <button
                key={tour.id}
                onClick={() => {
                  setCurrentTourIndex(idx);
                  setIsRunning(false);
                  setIsPause(false);
                  setTimerSeconds(0);
                }}
                className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold transition-all ${
                  idx === currentTourIndex
                    ? "bg-primary text-white scale-110"
                    : tour.status === "termine"
                    ? "bg-success/20 text-success"
                    : "bg-border text-muted"
                }`}
              >
                {tour.numero}
              </button>
            ))}
          </div>

          <p className="text-muted text-sm mb-6">
            Tour {currentTour.numero}/{data.tours.length}
            {isPause && " · Pause"}
          </p>

          {/* Chronomètre circulaire */}
          <div className="relative w-44 h-44 lg:w-56 lg:h-56 mb-6 lg:mb-8">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="44"
                fill="none" stroke="currentColor"
                className="text-border" strokeWidth="3"
              />
              <circle
                cx="50" cy="50" r="44"
                fill="none"
                className={
                  isLastSeconds
                    ? "text-danger"
                    : isPause
                    ? "text-warning"
                    : "text-primary"
                }
                strokeWidth="3" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 44}`}
                strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress)}`}
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={`text-3xl lg:text-4xl font-bold tabular-nums transition-colors ${
                  isLastSeconds
                    ? "text-danger animate-pulse-danger"
                    : "text-foreground"
                }`}
              >
                {timeDisplay}
              </span>
              <span className="text-xs text-muted mt-1">
                {isPause ? "pause" : "parole"}
              </span>
            </div>
          </div>

          {/* Boutons de contrôle */}
          <div className="flex items-center gap-2 lg:gap-3 flex-wrap justify-center">
            {currentTour.status === "en_attente" && !isPause && (
              <button
                onClick={startTour}
                className="py-3 px-6 lg:px-8 rounded-xl bg-primary hover:bg-primary-hover text-white font-medium transition-colors"
              >
                Lancer le tour {currentTour.numero}
              </button>
            )}

            {(currentTour.status === "en_cours" || isPause) && (
              <>
                {!isRunning && timerSeconds === 0 && (
                  <button
                    onClick={() => {
                      setTimerSeconds(totalTime);
                      setIsRunning(true);
                    }}
                    className="py-3 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white font-medium transition-colors"
                  >
                    {isPause ? "Lancer la pause" : "Relancer"}
                  </button>
                )}

                {!isRunning && timerSeconds > 0 && (
                  <button
                    onClick={startTimer}
                    className="py-3 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white font-medium transition-colors"
                  >
                    Reprendre
                  </button>
                )}

                {isRunning && (
                  <button
                    onClick={pauseTimer}
                    className="py-3 px-6 rounded-xl bg-warning hover:bg-warning/90 text-white font-medium transition-colors"
                  >
                    Pause
                  </button>
                )}

                <button
                  onClick={resetTimer}
                  className="py-3 px-6 rounded-xl border border-border text-foreground font-medium hover:bg-surface-hover transition-colors"
                >
                  R\u00e9initialiser
                </button>

                {!isPause && (
                  <button
                    onClick={finishTour}
                    className="py-3 px-6 rounded-xl bg-success hover:bg-success/90 text-white font-medium transition-colors"
                  >
                    {isLastTour ? "Terminer le dernier tour" : "Tour suivant \u2192"}
                  </button>
                )}

                {isPause && (
                  <button
                    onClick={() => {
                      setIsPause(false);
                      setIsRunning(false);
                      setTimerSeconds(0);
                    }}
                    className="py-3 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white font-medium transition-colors"
                  >
                    Commencer le tour {data.tours[currentTourIndex].numero}
                  </button>
                )}
              </>
            )}

            {currentTour.status === "termine" && !isPause && (
              <>
                {!isLastTour && (
                  <button
                    onClick={() => {
                      setCurrentTourIndex(currentTourIndex + 1);
                      setTimerSeconds(0);
                      setIsRunning(false);
                    }}
                    className="py-3 px-6 lg:px-8 rounded-xl bg-primary hover:bg-primary-hover text-white font-medium transition-colors"
                  >
                    Tour suivant \u2192
                  </button>
                )}
                {isLastTour && (
                  <button
                    onClick={finishEvent}
                    className="py-3 px-6 lg:px-8 rounded-xl bg-success hover:bg-success/90 text-white font-medium transition-colors"
                  >
                    Terminer l&apos;\u00e9v\u00e9nement
                  </button>
                )}
              </>
            )}
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="hidden lg:flex items-center gap-4 mt-6 text-xs text-muted">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-background border border-border text-[10px] font-mono">Espace</kbd> Play/Pause
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-background border border-border text-[10px] font-mono">Entr\u00e9e</kbd> Tour suivant
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-background border border-border text-[10px] font-mono">R</kbd> R\u00e9initialiser
            </span>
          </div>
        </div>

        {/* Tables du tour actuel */}
        <div className="space-y-4 overflow-y-auto lg:max-h-[calc(100vh-140px)]">
          <h2 className="text-lg font-semibold text-foreground sticky top-0 bg-background py-2 z-10">
            Tables — Tour {currentTour.numero}
          </h2>

          <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
            <div className="space-y-4 min-w-[320px]">
              {currentTour.tables.map((table) => (
                <div
                  key={table.tableId}
                  className="bg-surface rounded-xl border border-border p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground">
                      Table {table.numero}
                    </h3>
                    <span className="text-xs text-muted">
                      {table.participants.length} participants
                    </span>
                  </div>

                  <table className="w-full">
                    <thead>
                      <tr className="text-xs text-muted uppercase tracking-wider">
                        <th className="text-left py-1">Nom</th>
                        <th className="text-left py-1">Pr\u00e9nom</th>
                        <th className="text-right py-1">N\u00b0</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {table.participants.map((p) => (
                        <tr key={p.id}>
                          <td className="py-2 text-sm text-foreground font-medium">{p.nom}</td>
                          <td className="py-2 text-sm text-muted">{p.prenom}</td>
                          <td className="py-2 text-sm text-right">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary text-xs font-bold">
                              {p.numero}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}

              {currentTour.tables.length === 0 && (
                <p className="text-sm text-muted text-center py-8">
                  Aucune table pour ce tour.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
