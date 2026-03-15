"use client";

interface TimerCircleProps {
  seconds: number;
  totalSeconds: number;
  isRunning: boolean;
  isPause: boolean;
  timeDisplay: string;
  progress: number;
}

export function TimerCircle({
  seconds,
  isRunning,
  isPause,
  timeDisplay,
  progress,
}: TimerCircleProps) {
  const isWarning = seconds > 0 && seconds <= 10 && isRunning;
  const circumference = 2 * Math.PI * 44;

  return (
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
            isWarning
              ? "text-danger"
              : isPause
              ? "text-warning"
              : "text-primary"
          }
          strokeWidth="3" strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={`${circumference * (1 - progress)}`}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`text-3xl lg:text-4xl font-bold tabular-nums transition-colors ${
            isWarning
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
  );
}
