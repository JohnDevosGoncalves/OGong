"use client";

import { useRef, useState } from "react";

interface CSVImporterProps {
  eventId: string;
  onImported: () => void;
}

export default function CSVImporter({ eventId, onImported }: CSVImporterProps) {
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  async function handleCSVImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split("\n").filter((l) => l.trim());

    if (lines.length < 2) {
      setError("Le fichier CSV doit contenir au moins un en-tête et une ligne de données.");
      if (csvInputRef.current) csvInputRef.current.value = "";
      return;
    }

    const separator = lines[0].includes(";") ? ";" : ",";
    const headers = lines[0].split(separator).map((h) => h.trim().toLowerCase().replace(/"/g, ""));

    const nomIdx = headers.findIndex((h) => h === "nom");
    const prenomIdx = headers.findIndex((h) => h === "prenom" || h === "prénom");
    const emailIdx = headers.findIndex((h) => h === "email" || h === "e-mail" || h === "mail");
    const telIdx = headers.findIndex((h) => h === "telephone" || h === "téléphone" || h === "tel");

    if (nomIdx === -1 || prenomIdx === -1 || emailIdx === -1) {
      setError('Colonnes requises dans le CSV : "nom", "prenom", "email". Optionnel : "telephone".');
      if (csvInputRef.current) csvInputRef.current.value = "";
      return;
    }

    const participants = lines.slice(1).map((line) => {
      const cols = line.split(separator).map((c) => c.trim().replace(/"/g, ""));
      return {
        nom: cols[nomIdx] || "",
        prenom: cols[prenomIdx] || "",
        email: cols[emailIdx] || "",
        telephone: telIdx !== -1 ? cols[telIdx] || null : null,
      };
    }).filter((p) => p.nom && p.prenom && p.email);

    if (participants.length === 0) {
      setError("Aucun participant valide trouvé dans le CSV.");
      if (csvInputRef.current) csvInputRef.current.value = "";
      return;
    }

    const res = await fetch(`/api/evenements/${eventId}/participants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(participants),
    });

    const data = await res.json();

    if (res.ok) {
      setError("");
      if (data.skipped > 0) {
        setError(`${data.created} ajoutés, ${data.skipped} doublons ignorés.`);
      }
      onImported();
    } else {
      setError(data.error || "Erreur lors de l'import.");
    }

    if (csvInputRef.current) csvInputRef.current.value = "";
  }

  return (
    <>
      <input
        ref={csvInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleCSVImport}
      />
      <button
        onClick={() => csvInputRef.current?.click()}
        className="flex items-center gap-2 py-2 px-4 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-surface-hover transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
        </svg>
        Import CSV
      </button>
      {error && (
        <div className="col-span-full mb-4 p-3 rounded-lg bg-warning/10 border border-warning/20 text-warning text-sm">
          {error}
        </div>
      )}
    </>
  );
}
