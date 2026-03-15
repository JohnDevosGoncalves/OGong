"use client";

interface TourControlsProps {
  tourStatus: string;
  tourNumero: number;
  isPause: boolean;
  isRunning: boolean;
  timerSeconds: number;
  isLastTour: boolean;
  totalTime: number;
  onStartTour: () => void;
  onFinishTour: () => void;
  onFinishEvent: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onStartTimer: (duration: number) => void;
  onEndPause: () => void;
  onNextTour: () => void;
}

export function TourControls({
  tourStatus,
  tourNumero,
  isPause,
  isRunning,
  timerSeconds,
  isLastTour,
  totalTime,
  onStartTour,
  onFinishTour,
  onFinishEvent,
  onPause,
  onResume,
  onReset,
  onStartTimer,
  onEndPause,
  onNextTour,
}: TourControlsProps) {
  return (
    <div className="flex items-center gap-2 lg:gap-3 flex-wrap justify-center">
      {tourStatus === "en_attente" && !isPause && (
        <button
          onClick={onStartTour}
          className="py-3 px-6 lg:px-8 rounded-xl bg-primary hover:bg-primary-hover text-white font-medium transition-colors"
        >
          Lancer le tour {tourNumero}
        </button>
      )}

      {(tourStatus === "en_cours" || isPause) && (
        <>
          {!isRunning && timerSeconds === 0 && (
            <button
              onClick={() => onStartTimer(totalTime)}
              className="py-3 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white font-medium transition-colors"
            >
              {isPause ? "Lancer la pause" : "Relancer"}
            </button>
          )}

          {!isRunning && timerSeconds > 0 && (
            <button
              onClick={onResume}
              className="py-3 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white font-medium transition-colors"
            >
              Reprendre
            </button>
          )}

          {isRunning && (
            <button
              onClick={onPause}
              className="py-3 px-6 rounded-xl bg-warning hover:bg-warning/90 text-white font-medium transition-colors"
            >
              Pause
            </button>
          )}

          <button
            onClick={onReset}
            className="py-3 px-6 rounded-xl border border-border text-foreground font-medium hover:bg-surface-hover transition-colors"
          >
            R&eacute;initialiser
          </button>

          {!isPause && (
            <button
              onClick={onFinishTour}
              className="py-3 px-6 rounded-xl bg-success hover:bg-success/90 text-white font-medium transition-colors"
            >
              {isLastTour ? "Terminer le dernier tour" : "Tour suivant \u2192"}
            </button>
          )}

          {isPause && (
            <button
              onClick={onEndPause}
              className="py-3 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white font-medium transition-colors"
            >
              Commencer le tour {tourNumero}
            </button>
          )}
        </>
      )}

      {tourStatus === "termine" && !isPause && (
        <>
          {!isLastTour && (
            <button
              onClick={onNextTour}
              className="py-3 px-6 lg:px-8 rounded-xl bg-primary hover:bg-primary-hover text-white font-medium transition-colors"
            >
              Tour suivant &rarr;
            </button>
          )}
          {isLastTour && (
            <button
              onClick={onFinishEvent}
              className="py-3 px-6 lg:px-8 rounded-xl bg-success hover:bg-success/90 text-white font-medium transition-colors"
            >
              Terminer l&apos;&eacute;v&eacute;nement
            </button>
          )}
        </>
      )}
    </div>
  );
}
