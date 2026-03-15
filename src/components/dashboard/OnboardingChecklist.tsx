"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

const STORAGE_KEY = "ogong-onboarding-dismissed";

interface OnboardingStatus {
  emailVerifie: boolean;
  premierEvenement: boolean;
  premiersParticipants: boolean;
  premierTour: boolean;
}

interface ChecklistStep {
  label: string;
  done: boolean;
  href: string;
  cta: string;
}

function buildSteps(status: OnboardingStatus): ChecklistStep[] {
  return [
    {
      label: "Créer votre compte",
      done: true,
      href: "/compte",
      cta: "Voir mon compte",
    },
    {
      label: "Vérifier votre email",
      done: status.emailVerifie,
      href: "/compte",
      cta: "Vérifier",
    },
    {
      label: "Créer votre premier événement",
      done: status.premierEvenement,
      href: "/evenements/creer",
      cta: "Créer",
    },
    {
      label: "Ajouter des participants",
      done: status.premiersParticipants,
      href: "/evenements",
      cta: "Ajouter",
    },
    {
      label: "Lancer votre premier tour",
      done: status.premierTour,
      href: "/evenements",
      cta: "Lancer",
    },
  ];
}

export default function OnboardingChecklist() {
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const wasDismissed = localStorage.getItem(STORAGE_KEY) === "true";
    setDismissed(wasDismissed);

    if (wasDismissed) {
      setLoading(false);
      return;
    }

    fetch("/api/compte/onboarding")
      .then((res) => res.json())
      .then((data: OnboardingStatus) => {
        setStatus(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setDismissed(true);
  }, []);

  if (loading || dismissed || !status) return null;

  const steps = buildSteps(status);
  const completedCount = steps.filter((s) => s.done).length;
  const allDone = completedCount === steps.length;

  if (allDone) return null;

  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="bg-surface rounded-xl border border-border p-6 mb-8">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Bienvenue sur OGong !
          </h2>
          <p className="text-sm text-muted mt-0.5">
            Complétez ces étapes pour tirer le meilleur de votre expérience.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="text-muted hover:text-foreground transition-colors p-1 -mt-1 -mr-1"
          aria-label="Fermer la checklist"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-muted">
            {completedCount}/{steps.length} étapes complétées
          </span>
          <span className="text-xs font-medium text-primary">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={completedCount}
            aria-valuemin={0}
            aria-valuemax={steps.length}
            aria-label={`${completedCount} sur ${steps.length} étapes complétées`}
          />
        </div>
      </div>

      {/* Checklist */}
      <ul className="space-y-3">
        {steps.map((step) => (
          <li key={step.label} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {step.done ? (
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-success/15 text-success">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
              ) : (
                <span className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-border" aria-hidden="true" />
              )}
              <span
                className={`text-sm ${
                  step.done ? "text-muted line-through" : "text-foreground font-medium"
                }`}
              >
                {step.label}
              </span>
            </div>
            {!step.done && (
              <Link
                href={step.href}
                className="text-xs font-medium text-primary hover:text-primary-hover transition-colors px-3 py-1 rounded-md border border-primary/20 hover:bg-primary/5"
              >
                {step.cta}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
