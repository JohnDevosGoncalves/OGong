"use client";

export function KeyboardHints() {
  return (
    <div className="hidden lg:flex items-center gap-4 mt-6 text-xs text-muted">
      <span>
        <kbd className="px-1.5 py-0.5 rounded bg-background border border-border text-[10px] font-mono">Espace</kbd> Play/Pause
      </span>
      <span>
        <kbd className="px-1.5 py-0.5 rounded bg-background border border-border text-[10px] font-mono">Entr&eacute;e</kbd> Tour suivant
      </span>
      <span>
        <kbd className="px-1.5 py-0.5 rounded bg-background border border-border text-[10px] font-mono">R</kbd> R&eacute;initialiser
      </span>
    </div>
  );
}
