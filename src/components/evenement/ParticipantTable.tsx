"use client";

interface ParticipantRow {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  numero: number | null;
  present: boolean;
}

interface ParticipantTableProps {
  participants: ParticipantRow[];
  eventId: string;
  onUpdate: () => void;
}

export default function ParticipantTable({ participants, eventId, onUpdate }: ParticipantTableProps) {
  async function handleTogglePresence(participantId: string, currentPresent: boolean) {
    await fetch(`/api/evenements/${eventId}/participants`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId, present: !currentPresent }),
    });
    onUpdate();
  }

  async function handleDeleteParticipant(participantId: string) {
    await fetch(`/api/evenements/${eventId}/participants`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId }),
    });
    onUpdate();
  }

  if (participants.length === 0) {
    return (
      <p className="text-sm text-muted text-center py-12">
        Les participants apparaîtront ici une fois ajoutés.
      </p>
    );
  }

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-border">
          <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-2">N°</th>
          <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-2">Nom</th>
          <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-2">Prénom</th>
          <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-2">Email</th>
          <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-2">Tél.</th>
          <th className="text-center text-xs font-medium text-muted uppercase tracking-wider px-4 py-2">Présent</th>
          <th className="px-4 py-2" />
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {participants.map((p) => (
          <tr key={p.id} className="hover:bg-surface-hover transition-colors">
            <td className="px-4 py-2.5">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                {p.numero}
              </span>
            </td>
            <td className="px-4 py-2.5 text-sm text-foreground font-medium">{p.nom}</td>
            <td className="px-4 py-2.5 text-sm text-foreground">{p.prenom}</td>
            <td className="px-4 py-2.5 text-sm text-muted">{p.email}</td>
            <td className="px-4 py-2.5 text-sm text-muted">{p.telephone || "\u2014"}</td>
            <td className="px-4 py-2.5 text-center">
              <button
                onClick={() => handleTogglePresence(p.id, p.present)}
                className={`w-5 h-5 rounded border-2 inline-flex items-center justify-center transition-colors ${
                  p.present
                    ? "bg-primary border-primary text-white"
                    : "border-border hover:border-primary/50"
                }`}
                title={p.present ? "Marquer absent" : "Marquer présent"}
              >
                {p.present && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                )}
              </button>
            </td>
            <td className="px-4 py-2.5 text-right">
              <button
                onClick={() => handleDeleteParticipant(p.id)}
                className="text-xs text-danger hover:text-danger/80 transition-colors"
              >
                Supprimer
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
