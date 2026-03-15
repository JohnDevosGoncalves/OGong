"use client";

import { useEffect, useState, useCallback, useRef } from "react";

export interface UseFullscreenReturn {
  isFullscreen: boolean;
  toggle: () => void;
  ref: React.RefObject<HTMLDivElement | null>;
}

export function useFullscreen(): UseFullscreenReturn {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const toggle = useCallback(() => {
    if (!document.fullscreenElement) {
      ref.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  return { isFullscreen, toggle, ref };
}
