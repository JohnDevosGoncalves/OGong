"use client";

import { useState, useEffect, useRef } from "react";

interface ExportMenuProps {
  eventId: string;
  hasTours: boolean;
}

export default function ExportMenu({ eventId, hasTours }: ExportMenuProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  function handleExport(type: string) {
    setShowMenu(false);
    window.open(`/api/evenements/${eventId}/export?type=${type}`, "_blank");
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 py-2 px-4 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-surface-hover transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12M12 16.5V3" />
        </svg>
        Exporter
      </button>
      {showMenu && (
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
  );
}
