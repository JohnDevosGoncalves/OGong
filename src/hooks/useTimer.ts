"use client";

import { useEffect, useState, useCallback, useRef } from "react";

export interface UseTimerOptions {
  duration: number;
  onComplete?: () => void;
}

export interface UseTimerReturn {
  seconds: number;
  isRunning: boolean;
  progress: number;
  timeDisplay: string;
  start: () => void;
  pause: () => void;
  reset: () => void;
  setDuration: (d: number) => void;
  setSecondsDirectly: (s: number) => void;
  startWith: (d: number) => void;
}

function playBeep() {
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
}

export function useTimer({ duration, onComplete }: UseTimerOptions): UseTimerReturn {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [totalTime, setTotalTime] = useState(duration);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);

  // Keep callback ref fresh
  onCompleteRef.current = onComplete;

  // Sync duration prop changes
  useEffect(() => {
    setTotalTime(duration);
  }, [duration]);

  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            playBeep();
            onCompleteRef.current?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, seconds]);

  const start = useCallback(() => {
    if (seconds === 0) {
      setSeconds(totalTime);
    }
    setIsRunning(true);
  }, [seconds, totalTime]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setSeconds(totalTime);
  }, [totalTime]);

  const setDuration = useCallback((d: number) => {
    setTotalTime(d);
  }, []);

  const setSecondsDirectly = useCallback((s: number) => {
    setSeconds(s);
  }, []);

  const startWith = useCallback((d: number) => {
    setTotalTime(d);
    setSeconds(d);
    setIsRunning(true);
  }, []);

  const progress = totalTime > 0 ? (totalTime - seconds) / totalTime : 0;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timeDisplay = `${minutes}:${String(secs).padStart(2, "0")}`;

  return {
    seconds,
    isRunning,
    progress,
    timeDisplay,
    start,
    pause,
    reset,
    setDuration,
    setSecondsDirectly,
    startWith,
  };
}
