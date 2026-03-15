"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import EvenementForm, { EventFormData } from "@/components/evenement/EvenementForm";

export default function CreerEvenementPage() {
  const router = useRouter();

  async function handleSubmit(data: EventFormData) {
    const res = await fetch("/api/evenements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error || "Erreur lors de la création.");
    }

    const evenement = await res.json();
    router.push(`/evenements/${evenement.id}`);
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/evenements"
          className="p-2 rounded-lg hover:bg-surface-hover transition-colors text-muted hover:text-foreground"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Créer un évènement
          </h1>
          <p className="text-muted text-sm mt-1">
            Configurez votre événement de networking.
          </p>
        </div>
      </div>

      <EvenementForm
        onSubmit={handleSubmit}
        isEdit={false}
        submitLabel="Créer l'événement"
        submittingLabel="Création en cours…"
      />
    </div>
  );
}
