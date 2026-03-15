"use client";

import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { LanguageSwitcher } from "@/components/ui";

interface HeaderProps {
  userName?: string;
}

export default function Header({ userName = "Utilisateur" }: HeaderProps) {
  const [evtCount, setEvtCount] = useState<number | null>(null);
  const { t } = useLocale();

  useEffect(() => {
    fetch("/api/evenements")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setEvtCount(data.length);
      })
      .catch(() => {});
  }, []);

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-8">
      <p className="text-sm text-muted">
        {t.header.greeting}{" "}
        <span className="text-foreground font-medium">{userName}</span>
      </p>

      <div className="flex items-center gap-4">
        {/* Active events count */}
        {evtCount !== null && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">{t.header.eventsLabel} :</span>
            <span
              className="flex items-center justify-center h-6 px-2 rounded-full bg-primary/10 text-primary text-xs font-bold"
              aria-label={`${evtCount} ${t.header.eventsLabel.toLowerCase()}`}
            >
              {evtCount}
            </span>
          </div>
        )}

        {/* Thème */}
        <ThemeToggle />

        {/* Language switcher */}
        <LanguageSwitcher />

        {/* Notifications */}
        <button
          className="relative p-2 text-muted hover:text-foreground transition-colors"
          aria-label={t.notifications.label}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
          </svg>
        </button>

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/connexion" })}
          className="text-sm text-muted hover:text-danger transition-colors"
        >
          {t.header.logout}
        </button>
      </div>
    </header>
  );
}
