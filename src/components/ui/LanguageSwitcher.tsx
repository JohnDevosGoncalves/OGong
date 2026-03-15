"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n";

const localeConfig: Record<Locale, { flag: string; shortLabel: string }> = {
  fr: { flag: "\ud83c\uddeb\ud83c\uddf7", shortLabel: "FR" },
  en: { flag: "\ud83c\uddec\ud83c\udde7", shortLabel: "EN" },
};

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();

  const nextLocale: Locale = locale === "fr" ? "en" : "fr";
  const current = localeConfig[locale];
  const next = localeConfig[nextLocale];

  return (
    <button
      onClick={() => setLocale(nextLocale)}
      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium text-muted hover:text-foreground hover:bg-muted/10 transition-colors"
      aria-label={`${t.languageSwitcher.label} — ${t.languageSwitcher[nextLocale]}`}
      title={t.languageSwitcher.label}
    >
      <span aria-hidden="true">{current.flag}</span>
      <span>{current.shortLabel}</span>
      <span className="text-muted/50" aria-hidden="true">/</span>
      <span className="text-muted/50">{next.shortLabel}</span>
    </button>
  );
}
