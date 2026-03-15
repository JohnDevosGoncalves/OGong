"use client";

import { Card, Accordion } from "@/components/ui";
import type { AccordionItem } from "@/components/ui";

const quickStartSteps = [
  {
    number: 1,
    title: "Créez votre événement",
    description:
      "Choisissez un format (Speed Meeting, Team Building ou Job Dating), définissez les horaires et les durées des tours.",
  },
  {
    number: 2,
    title: "Ajoutez vos participants",
    description:
      "Importez vos participants manuellement ou via un fichier CSV. Vous pouvez aussi partager le lien d'inscription.",
  },
  {
    number: 3,
    title: "Partagez le lien d'inscription",
    description:
      "Envoyez le lien unique de votre événement aux participants pour qu'ils s'inscrivent eux-mêmes.",
  },
  {
    number: 4,
    title: "Lancez les tours",
    description:
      "L'algorithme répartit automatiquement les participants. Chaque tour est minuté avec un chronomètre intégré.",
  },
  {
    number: 5,
    title: "Exportez les résultats",
    description:
      "Téléchargez les données de votre événement en CSV pour analyser les rencontres et les résultats.",
  },
];

const faqItems: AccordionItem[] = [
  {
    title: "Combien de participants puis-je gérer ?",
    content: "De 20 à 150 participants par événement.",
  },
  {
    title: "Comment fonctionne l'algorithme ?",
    content:
      "Notre algorithme basé sur l'arithmétique modulaire Z_T garantit que chaque participant rencontre un maximum de personnes sans jamais croiser la même personne deux fois.",
  },
  {
    title: "Qu'est-ce qu'un crédit ?",
    content:
      "Un crédit = un événement. Vous recevez 5 crédits gratuits à l'inscription.",
  },
  {
    title: "Puis-je modifier un événement en cours ?",
    content:
      "Oui, vous pouvez modifier les informations de l'événement tant qu'il n'est pas terminé.",
  },
  {
    title: "Comment inviter un collaborateur ?",
    content:
      "Dans la page de détail de votre événement, utilisez la section Collaborateurs pour inviter par email.",
  },
  {
    title: "Comment exporter les résultats ?",
    content:
      "Depuis la page de détail, cliquez sur Exporter pour télécharger les données en CSV.",
  },
  {
    title: "L'application fonctionne-t-elle sur mobile ?",
    content:
      "Oui, OGong est une application responsive et installable (PWA).",
  },
  {
    title: "Comment supprimer mon compte ?",
    content:
      "Allez dans Mon compte, puis dans la Zone dangereuse, et cliquez sur Supprimer mon compte.",
  },
];

const shortcuts = [
  { key: "Espace", description: "Démarrer / Mettre en pause le chronomètre" },
  { key: "Entrée", description: "Passer au tour suivant" },
  { key: "R", description: "Réinitialiser le chronomètre" },
  { key: "F", description: "Mode plein écran" },
  { key: "Échap", description: "Quitter le plein écran" },
];

export default function AidePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Aide</h1>
        <p className="text-muted text-sm mt-1">
          Tout ce que vous devez savoir pour utiliser OGong efficacement.
        </p>
      </div>

      <div className="space-y-8 max-w-3xl">
        {/* Guide de démarrage rapide */}
        <Card title="Guide de démarrage rapide" subtitle="Les 5 étapes pour organiser votre premier événement.">
          <ol className="space-y-5">
            {quickStartSteps.map((step) => (
              <li key={step.number} className="flex gap-4">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">
                  {step.number}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {step.title}
                  </p>
                  <p className="text-sm text-muted mt-0.5">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Card>

        {/* FAQ */}
        <Card title="Questions fréquentes">
          <Accordion items={faqItems} />
        </Card>

        {/* Raccourcis clavier */}
        <Card title="Raccourcis clavier" subtitle="Utilisables sur la page de gestion des tours.">
          <div className="space-y-2">
            {shortcuts.map((shortcut) => (
              <div
                key={shortcut.key}
                className="flex items-center gap-3 py-2"
              >
                <kbd className="inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1 rounded-md border border-border bg-background text-xs font-mono font-medium text-foreground">
                  {shortcut.key}
                </kbd>
                <span className="text-sm text-muted">
                  {shortcut.description}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Contact support */}
        <Card title="Besoin d'aide ?">
          <p className="text-sm text-muted">
            Une question ? Contactez-nous à{" "}
            <a
              href="mailto:support@ogong.fr"
              className="text-primary hover:text-primary-hover font-medium transition-colors"
            >
              support@ogong.fr
            </a>
          </p>
        </Card>
      </div>
    </div>
  );
}
