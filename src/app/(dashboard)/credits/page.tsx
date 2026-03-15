"use client";

import { useEffect, useState } from "react";

interface CreditStats {
  speed_meeting: number;
  team: number;
  job_dating: number;
}

const packs = [
  {
    nom: "Speed Meeting",
    format: "speed_meeting",
    description: "Événements 1 à 1 minutés",
    prix: "29€",
    prixDetail: "/ événement",
    color: "border-primary/20 hover:border-primary/40",
    badge: "bg-primary/10 text-primary",
    circle: "bg-primary/10 text-primary",
  },
  {
    nom: "Team",
    format: "team",
    description: "Sessions en équipe XS à XL",
    prix: "29€",
    prixDetail: "/ événement",
    color: "border-accent/20 hover:border-accent/40",
    badge: "bg-accent/10 text-accent",
    circle: "bg-accent/10 text-accent",
  },
  {
    nom: "Job Dating",
    format: "job_dating",
    description: "Événements avec exposants et créneaux",
    prix: "29€",
    prixDetail: "/ événement",
    color: "border-success/20 hover:border-success/40",
    badge: "bg-success/10 text-success",
    circle: "bg-success/10 text-success",
  },
];

export default function CreditsPage() {
  const [evtCounts, setEvtCounts] = useState<CreditStats>({ speed_meeting: 0, team: 0, job_dating: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/statistiques")
      .then((res) => res.json())
      .then((data) => {
        if (data.parFormat) {
          setEvtCounts(data.parFormat);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center text-muted py-20">Chargement…</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Crédits &amp; Facturation</h1>
      <p className="text-muted text-sm mb-8">
        Chaque événement lancé consomme un crédit. Voici le récapitulatif de votre utilisation.
      </p>

      {/* Utilisation actuelle */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {packs.map((pack) => (
          <div key={pack.format} className="bg-surface rounded-xl border border-border p-6 flex items-center gap-4">
            <span className={`flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold ${pack.circle}`}>
              {evtCounts[pack.format as keyof CreditStats]}
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">{pack.nom}</p>
              <p className="text-xs text-muted">événement{evtCounts[pack.format as keyof CreditStats] > 1 ? "s" : ""} créé{evtCounts[pack.format as keyof CreditStats] > 1 ? "s" : ""}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tarifs */}
      <h2 className="text-lg font-semibold text-foreground mb-5">
        Tarification
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Découverte */}
        <div className="bg-surface rounded-xl border-2 border-border p-6">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted/10 text-muted">
            Découverte
          </span>
          <p className="text-muted text-sm mt-3 mb-4">Parfait pour tester l&apos;outil.</p>
          <p className="text-3xl font-bold text-foreground mb-1">Gratuit</p>
          <p className="text-xs text-muted mb-6">jusqu&apos;à 20 participants</p>
          <ul className="space-y-2 text-sm text-muted mb-6">
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Tous les formats disponibles
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Chrono temps réel
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Assignation automatique
            </li>
          </ul>
        </div>

        {/* Pro */}
        <div className="bg-surface rounded-xl border-2 border-primary/40 p-6 relative">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-medium px-3 py-0.5 rounded-full bg-primary text-white">
            Recommandé
          </span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
            Pro
          </span>
          <p className="text-muted text-sm mt-3 mb-4">Sans abonnement. Facturé le jour J.</p>
          <p className="text-3xl font-bold text-foreground mb-1">
            29 <span className="text-lg">€</span>
          </p>
          <p className="text-xs text-muted mb-6">/ événement</p>
          <ul className="space-y-2 text-sm text-muted mb-6">
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Jusqu&apos;à 200 participants
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Export CSV des données
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Statistiques complètes
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Support prioritaire
            </li>
          </ul>
        </div>

        {/* Entreprise */}
        <div className="bg-surface rounded-xl border-2 border-border p-6">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-success/10 text-success">
            Entreprise
          </span>
          <p className="text-muted text-sm mt-3 mb-4">Pour les structures qui organisent régulièrement.</p>
          <p className="text-3xl font-bold text-foreground mb-1">Sur devis</p>
          <p className="text-xs text-muted mb-6">abonnement annuel</p>
          <ul className="space-y-2 text-sm text-muted mb-6">
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Participants illimités
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Multi-administrateurs
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Accompagnement dédié
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Idéal CCI, grandes écoles
            </li>
          </ul>
          <button className="w-full py-2.5 px-4 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-surface-hover transition-colors">
            Nous contacter
          </button>
        </div>
      </div>
    </div>
  );
}
