"use client";

interface HeaderProps {
  userName?: string;
}

export default function Header({ userName = "Marie Pierre" }: HeaderProps) {
  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-8">
      <p className="text-sm text-muted">
        Bonjour <span className="text-foreground font-medium">{userName}</span>
      </p>

      <div className="flex items-center gap-4">
        {/* Crédits */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">Vos crédits :</span>
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">
            4
          </span>
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-white text-xs font-bold">
            2
          </span>
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-warning text-white text-xs font-bold">
            1
          </span>
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 text-muted hover:text-foreground transition-colors"
          aria-label="Notifications"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
        </button>
      </div>
    </header>
  );
}
