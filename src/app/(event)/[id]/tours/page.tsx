"use client";

import type { Metadata } from "next";

// Données de démo
const tables = [
  {
    numero: 1,
    participants: [
      { nom: "Pan", prenom: "Hyuk", numero: 1 },
      { nom: "Emlen", prenom: "Bea", numero: 2 },
      { nom: "Jozef", prenom: "Kons", numero: 3 },
    ],
  },
  {
    numero: 2,
    participants: [
      { nom: "Gabie", prenom: "Shel", numero: 4 },
      { nom: "Duval", prenom: "Marc", numero: 5 },
      { nom: "Kira", prenom: "Yumi", numero: 6 },
    ],
  },
  {
    numero: 3,
    participants: [
      { nom: "Lopez", prenom: "Ana", numero: 7 },
      { nom: "Chen", prenom: "Wei", numero: 8 },
      { nom: "Martin", prenom: "Léo", numero: 9 },
    ],
  },
];

export default function ToursPage() {
  return (
    <div className="p-6 lg:p-8">
      {/* Titre événement */}
      <h1 className="text-xl font-bold text-foreground mb-6">Demo day</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        {/* Timer central */}
        <div className="bg-surface rounded-2xl border border-border p-8 flex flex-col items-center justify-center">
          {/* Logo société */}
          <div className="mb-8 text-center">
            <p className="text-lg font-bold text-foreground">Wild Code School</p>
          </div>

          {/* Status */}
          <p className="text-2xl font-bold text-foreground mb-4">
            C&apos;est à vous !
          </p>

          {/* Indicateurs de tour */}
          <div className="flex items-center gap-2 mb-4">
            {[1, 4, 7].map((n) => (
              <span
                key={n}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-white text-sm font-bold"
              >
                {n}
              </span>
            ))}
          </div>

          <p className="text-muted text-sm mb-6">Tour 1/4</p>

          {/* Barre de progression */}
          <div className="w-full max-w-md">
            <div className="flex items-center justify-between text-sm text-muted mb-2">
              <span>Prise de parole 1/3</span>
              <span>0:45/4:00</span>
            </div>
            <div className="w-full h-3 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-1000"
                style={{ width: "18.75%" }}
              />
            </div>
          </div>

          {/* Chronomètre circulaire */}
          <div className="mt-10 relative w-48 h-48">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="4"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="#5b4cff"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 44}`}
                strokeDashoffset={`${2 * Math.PI * 44 * (1 - 0.1875)}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-foreground">0:15</span>
            </div>
          </div>
        </div>

        {/* Tables */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Tables 1 à {tables.length}
          </h2>

          {tables.map((table) => (
            <div
              key={table.numero}
              className="bg-surface rounded-xl border border-border p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">
                  Table {table.numero}
                </h3>
                <span className="text-xs text-muted">
                  {table.participants.length} participants
                </span>
              </div>

              <table className="w-full">
                <thead>
                  <tr className="text-xs text-muted uppercase tracking-wider">
                    <th className="text-left py-1">Nom</th>
                    <th className="text-left py-1">Prénom</th>
                    <th className="text-right py-1">N°</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {table.participants.map((p) => (
                    <tr key={p.numero}>
                      <td className="py-2 text-sm text-foreground">{p.nom}</td>
                      <td className="py-2 text-sm text-muted">{p.prenom}</td>
                      <td className="py-2 text-sm text-right">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-accent/10 text-accent text-xs font-bold">
                          {p.numero}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
