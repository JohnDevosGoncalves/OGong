"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import EvenementForm, { EventFormData } from "@/components/evenement/EvenementForm";

interface EvenementData extends EventFormData {
  id: string;
  status: string;
  _count: { participants: number };
}

export default function ModifierEvenementPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [evt, setEvt] = useState<EvenementData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEvent = useCallback(() => {
    fetch(`/api/evenements/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: EvenementData) => {
        setEvt(data);
        setLoading(false);
      })
      .catch(() => {
        router.push("/evenements");
      });
  }, [id, router]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  async function handleSubmit(data: EventFormData) {
    const res = await fetch(`/api/evenements/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error || "Erreur lors de la modification.");
    }

    router.push(`/evenements/${id}`);
  }

  if (loading) {
    return <div className="text-center text-muted py-20">Chargement...</div>;
  }

  if (!evt) return null;

  const hasParticipants = evt._count.participants > 0;

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={`/evenements/${id}`}
          className="p-2 rounded-lg hover:bg-surface-hover transition-colors text-muted hover:text-foreground"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Modifier l&apos;événement
          </h1>
          <p className="text-muted text-sm mt-1">
            Modifiez les paramètres de votre événement.
          </p>
        </div>
      </div>

      <EvenementForm
        initialData={evt}
        onSubmit={handleSubmit}
        isEdit={true}
        submitLabel="Enregistrer les modifications"
        submittingLabel="Enregistrement..."
        formatDisabled={hasParticipants}
        cancelHref={`/evenements/${id}`}
      />
    </div>
  );
}
