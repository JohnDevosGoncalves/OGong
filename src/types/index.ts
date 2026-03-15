// ─── Rôles ───────────────────────────────────────────────
export type Role = "super_admin" | "admin" | "animateur";

// ─── Utilisateur ─────────────────────────────────────────
export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: Role;
  societeId?: string;
  createdAt: Date;
}

// ─── Société ─────────────────────────────────────────────
export interface Societe {
  id: string;
  nom: string;
  adresse?: string;
  proprietaireId: string;
  createdAt: Date;
}

// ─── Formats d'événement ─────────────────────────────────
export type EventFormat = "speed_meeting" | "team" | "job_dating";

export type TeamSize = "XS" | "S" | "M" | "L" | "XL";

// ─── Événement ───────────────────────────────────────────
export interface Evenement {
  id: string;
  titre: string;
  description: string;
  messageFin: string;
  format: EventFormat;
  teamSize?: TeamSize;
  societeId: string;
  date: Date;
  heureDebut: string; // "HH:MM"
  heureFin: string;
  tempsParoleTour: number; // secondes
  tempsPauseTour: number; // secondes
  debutPause?: string; // "HH:MM"
  finPause?: string;
  animateurs: string[]; // User IDs
  status: "brouillon" | "ouvert" | "en_cours" | "termine";
  createdAt: Date;
}

// ─── Table ───────────────────────────────────────────────
export interface Table {
  id: string;
  numero: number;
  evenementId: string;
  participantIds: string[];
}

// ─── Participant ─────────────────────────────────────────
export interface Participant {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  evenementId: string;
  tableId?: string;
  numero?: number;
  present: boolean;
  createdAt: Date;
}

// ─── Exposant (Job Dating) ───────────────────────────────
export interface Exposant {
  id: string;
  societeId: string;
  evenementId: string;
  creneaux: Creneau[];
}

export interface Creneau {
  id: string;
  exposantId: string;
  heureDebut: string;
  heureFin: string;
  participantIds: string[];
  maxParticipants: number;
}

// ─── Tour ────────────────────────────────────────────────
export interface Tour {
  numero: number;
  evenementId: string;
  priseDeParole: number; // numéro de la prise de parole en cours
  totalPrisesDeParole: number;
  tempsEcoule: number; // secondes
  tempsDuTour: number; // secondes
  status: "en_attente" | "en_cours" | "pause" | "termine";
}

// ─── Crédits ─────────────────────────────────────────────
export type CreditType = "speed_meeting" | "team" | "job_dating";

export interface Credit {
  type: CreditType;
  quantite: number;
}

export interface PackCredit {
  id: string;
  nom: string;
  credits: Credit[];
  prix: number; // centimes
}

// ─── Statistiques ────────────────────────────────────────
export interface StatEvenement {
  evenementId: string;
  totalParticipants: number;
  totalPresents: number;
  totalTours: number;
  dureeReelle: number; // secondes
}
