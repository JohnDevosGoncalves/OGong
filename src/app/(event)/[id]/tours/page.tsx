"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { useTimer } from "@/hooks/useTimer";
import { useFullscreen } from "@/hooks/useFullscreen";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

import { TimerCircle } from "@/components/tours/TimerCircle";
import { TourControls } from "@/components/tours/TourControls";
import { TourIndicators } from "@/components/tours/TourIndicators";
import { TableList } from "@/components/tours/TableList";
import { TourSummary } from "@/components/tours/TourSummary";
import { KeyboardHints } from "@/components/tours/KeyboardHints";

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

// ─── Composant Principal ────────────────────────────────────

export default function ToursPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [data, setData] = useState<ToursData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentTourIndex, setCurrentTourIndex] = useState(0);
  const [isPause, setIsPause] = useState(false);
  const [showTimeUp, setShowTimeUp] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const { isFullscreen, toggle: toggleFullscreen, ref: pageRef } = useFullscreen();

  const totalTime = data
    ? isPause
      ? data.evenement.tempsPauseTour
      : data.evenement.tempsParoleTour
    : 0;

  const timer = useTimer({
    duration: totalTime,
    onComplete: () => {
      setShowTimeUp(true);
      setTimeout(() => setShowTimeUp(false), 2500);
    },
  });

  // ─── Fetch des tours ────────────────────────────────────

  const fetchTours = useCallback(async () => {
    try {
      const res = await fetch(`/api/evenements/${id}/tours`);
      if (!res.ok) throw new Error();
      const toursData: ToursData = await res.json();
      setData(toursData);

      if (toursData.tours.length === 0) {
        setGenerating(true);
        const genRes = await fetch(`/api/evenements/${id}/tours`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        if (genRes.ok) {
          const res2 = await fetch(`/api/evenements/${id}/tours`);
          if (res2.ok) {
            const newData = await res2.json();
            setData(newData);
          }
        }
        setGenerating(false);
      }

      const enCoursIdx = toursData.tours.findIndex((t) => t.status === "en_cours");
      if (enCoursIdx >= 0) {
        setCurrentTourIndex(enCoursIdx);
      } else {
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

  // ─── Actions ────────────────────────────────────────────

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
    timer.startWith(data.evenement.tempsParoleTour);

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

    timer.pause();

    await fetch(`/api/evenements/${id}/tours`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tourId: tour.id, status: "termine" }),
    });

    setData((prev) => {
      if (!prev) return prev;
      const tours = [...prev.tours];
      tours[currentTourIndex] = { ...tours[currentTourIndex], status: "termine" };
      return { ...prev, tours };
    });

    if (currentTourIndex < data.tours.length - 1) {
      setCurrentTourIndex(currentTourIndex + 1);
      setIsPause(true);
      timer.setSecondsDirectly(data.evenement.tempsPauseTour);
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

  function handleSelectTour(idx: number) {
    setCurrentTourIndex(idx);
    timer.pause();
    timer.setSecondsDirectly(0);
    setIsPause(false);
  }

  function handleEndPause() {
    setIsPause(false);
    timer.pause();
    timer.setSecondsDirectly(0);
  }

  function handleNextTour() {
    setCurrentTourIndex(currentTourIndex + 1);
    timer.setSecondsDirectly(0);
    timer.pause();
  }

  // ─── Keyboard shortcuts ───────────────────────────────

  const shortcuts = useMemo(
    () => ({
      Space: () => {
        if (timer.isRunning) {
          timer.pause();
        } else if (timer.seconds > 0) {
          timer.start();
        } else if (totalTime > 0) {
          timer.startWith(totalTime);
        }
      },
      Enter: () => {
        if (!data) return;
        const currentTour = data.tours[currentTourIndex];
        if (currentTour?.status === "en_cours" && !isPause) {
          finishTour();
        }
      },
      KeyR: () => {
        timer.reset();
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [timer.isRunning, timer.seconds, totalTime, currentTourIndex, isPause, data]
  );

  useKeyboardShortcuts(shortcuts);

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
        <p className="text-muted mb-4">Aucun tour g&eacute;n&eacute;r&eacute;.</p>
        <Link href={`/evenements/${id}`} className="text-primary hover:underline">
          Retour &agrave; l&apos;&eacute;v&eacute;nement
        </Link>
      </div>
    );
  }

  if (showSummary) {
    return (
      <TourSummary
        eventId={id}
        eventTitle={data.evenement.titre}
        totalParticipants={data.totalParticipants}
        tours={data.tours}
      />
    );
  }

  const currentTour = data.tours[currentTourIndex];
  const isLastTour = currentTourIndex === data.tours.length - 1;
  const allToursTerminated = data.tours.every((t) => t.status === "termine");

  return (
    <div ref={pageRef} className="p-4 lg:p-8 min-h-screen bg-background">
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
              {data.totalParticipants} participants &middot; {data.totalTables} tables &middot; {data.tours.length} tours
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
              Terminer l&apos;&eacute;v&eacute;nement
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-8">
        {/* Timer central */}
        <div className="bg-surface rounded-2xl border border-border p-6 lg:p-8 flex flex-col items-center justify-center sticky top-4 z-10 lg:static">
          {/* "Temps ecoul\u00e9 !" overlay */}
          {showTimeUp && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface/90 rounded-2xl z-20 animate-fade-in-up">
              <p className="text-3xl lg:text-4xl font-bold text-danger">
                Temps &eacute;coul&eacute; !
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

          <TourIndicators
            tours={data.tours}
            currentIndex={currentTourIndex}
            onSelect={handleSelectTour}
          />

          <p className="text-muted text-sm mb-6">
            Tour {currentTour.numero}/{data.tours.length}
            {isPause && " \u00b7 Pause"}
          </p>

          <TimerCircle
            seconds={timer.seconds}
            totalSeconds={totalTime}
            isRunning={timer.isRunning}
            isPause={isPause}
            timeDisplay={timer.timeDisplay}
            progress={timer.progress}
          />

          <TourControls
            tourStatus={currentTour.status}
            tourNumero={data.tours[currentTourIndex].numero}
            isPause={isPause}
            isRunning={timer.isRunning}
            timerSeconds={timer.seconds}
            isLastTour={isLastTour}
            totalTime={totalTime}
            onStartTour={startTour}
            onFinishTour={finishTour}
            onFinishEvent={finishEvent}
            onPause={timer.pause}
            onResume={timer.start}
            onReset={timer.reset}
            onStartTimer={(d) => timer.startWith(d)}
            onEndPause={handleEndPause}
            onNextTour={handleNextTour}
          />

          <KeyboardHints />
        </div>

        {/* Tables du tour actuel */}
        <TableList tables={currentTour.tables} tourNumero={currentTour.numero} />
      </div>
    </div>
  );
}
