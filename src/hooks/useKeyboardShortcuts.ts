"use client";

import { useEffect } from "react";

export function useKeyboardShortcuts(
  shortcuts: Record<string, () => void>,
  enabled = true
): void {
  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const handler = shortcuts[e.code];
      if (handler) {
        // Ignore when Cmd/Ctrl is held, except for specific codes if needed
        if ((e.metaKey || e.ctrlKey) && e.code !== "Space" && e.code !== "Enter") {
          return;
        }
        e.preventDefault();
        handler();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts, enabled]);
}
