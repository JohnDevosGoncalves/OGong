"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { StatCard } from "@/components/ui";
import { Card } from "@/components/ui";
import { Badge } from "@/components/ui";

interface CreditTransaction {
  id: string;
  montant: number;
  type: string;
  detail: string | null;
  createdAt: string;
}

interface CreditsData {
  solde: number;
  historique: CreditTransaction[];
}

const PACKS = [
  { id: "pack_10", credits: 10, prix: 9.99, label: "10 credits", populaire: false },
  { id: "pack_25", credits: 25, prix: 19.99, label: "25 credits", populaire: true },
  { id: "pack_50", credits: 50, prix: 34.99, label: "50 credits", populaire: false },
  { id: "pack_100", credits: 100, prix: 59.99, label: "100 credits", populaire: false },
] as const;

const TYPE_LABELS: Record<string, { label: string; variant: "success" | "warning" | "primary" }> = {
  achat: { label: "Achat", variant: "success" },
  utilisation: { label: "Utilisation", variant: "warning" },
  bonus: { label: "Bonus", variant: "primary" },
};

export default function CreditsPage() {
  const [data, setData] = useState<CreditsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [buyingPack, setBuyingPack] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetch("/api/credits")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Gestion des query params success/cancelled
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      setMessage({ type: "success", text: "Paiement effectue avec succes ! Vos credits ont ete ajoutes." });
      // Rafraichir les donnees
      fetch("/api/credits")
        .then((res) => res.json())
        .then((d) => setData(d))
        .catch(() => {});
      // Nettoyer l'URL
      window.history.replaceState({}, "", "/credits");
    }
    if (params.get("cancelled") === "true") {
      setMessage({ type: "error", text: "Paiement annule." });
      window.history.replaceState({}, "", "/credits");
    }
  }, []);

  async function handleBuy(packId: string) {
    setBuyingPack(packId);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });

      const result = await res.json();

      if (res.ok && result.url) {
        window.location.href = result.url;
      } else {
        setMessage({ type: "error", text: result.error || "Erreur lors de la creation de la session de paiement." });
        setBuyingPack(null);
      }
    } catch {
      setMessage({ type: "error", text: "Erreur de connexion au serveur." });
      setBuyingPack(null);
    }
  }

  if (loading) {
    return <div className="text-center text-muted py-20">Chargement...</div>;
  }

  const solde = data?.solde ?? 0;
  const historique = data?.historique ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Credits</h1>
      <p className="text-muted text-sm mb-8">
        Achetez des credits pour creer des evenements. Chaque evenement consomme 1 credit.
      </p>

      {message.text && (
        <div
          className={`mb-6 p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-success/10 border border-success/20 text-success"
              : "bg-danger/10 border border-danger/20 text-danger"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Solde */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard
          label="Solde actuel"
          value={solde}
          detail={`credit${solde > 1 ? "s" : ""} disponible${solde > 1 ? "s" : ""}`}
        />
        <StatCard
          label="Credits achetes"
          value={historique.filter((t) => t.type === "achat").reduce((sum, t) => sum + t.montant, 0)}
          detail="au total"
        />
        <StatCard
          label="Credits utilises"
          value={Math.abs(historique.filter((t) => t.type === "utilisation").reduce((sum, t) => sum + t.montant, 0))}
          detail="evenements crees"
        />
      </div>

      {/* Packs de credits */}
      <h2 className="text-lg font-semibold text-foreground mb-5">Acheter des credits</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {PACKS.map((pack) => (
          <div
            key={pack.id}
            className={`bg-surface rounded-xl border-2 p-6 relative ${
              pack.populaire ? "border-primary/40" : "border-border"
            }`}
          >
            {pack.populaire && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-medium px-3 py-0.5 rounded-full bg-primary text-white">
                Populaire
              </span>
            )}
            <p className="text-3xl font-bold text-foreground mb-1">
              {pack.prix.toFixed(2).replace(".", ",")} <span className="text-lg">EUR</span>
            </p>
            <p className="text-sm text-muted mb-1">{pack.credits} credits</p>
            <p className="text-xs text-muted mb-6">
              {(pack.prix / pack.credits).toFixed(2).replace(".", ",")} EUR / credit
            </p>
            <Button
              variant={pack.populaire ? "primary" : "outline"}
              size="md"
              className="w-full"
              loading={buyingPack === pack.id}
              disabled={buyingPack !== null}
              onClick={() => handleBuy(pack.id)}
            >
              Acheter
            </Button>
          </div>
        ))}
      </div>

      {/* Historique des transactions */}
      <Card title="Historique des transactions">
        {historique.length === 0 ? (
          <p className="text-sm text-muted py-4">Aucune transaction pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 font-medium text-muted">Date</th>
                  <th className="pb-3 font-medium text-muted">Type</th>
                  <th className="pb-3 font-medium text-muted">Credits</th>
                  <th className="pb-3 font-medium text-muted">Detail</th>
                </tr>
              </thead>
              <tbody>
                {historique.map((tx) => {
                  const typeConfig = TYPE_LABELS[tx.type] ?? { label: tx.type, variant: "muted" as const };
                  return (
                    <tr key={tx.id} className="border-b border-border/50">
                      <td className="py-3 text-foreground">
                        {new Date(tx.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3">
                        <Badge variant={typeConfig.variant}>{typeConfig.label}</Badge>
                      </td>
                      <td className={`py-3 font-medium ${tx.montant > 0 ? "text-success" : "text-danger"}`}>
                        {tx.montant > 0 ? `+${tx.montant}` : tx.montant}
                      </td>
                      <td className="py-3 text-muted">{tx.detail || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
