export const FORMAT_LABELS: Record<string, string> = {
  speed_meeting: "Speed meeting",
  team: "Team",
  job_dating: "Job dating",
};

export const STATUS_CONFIG: Record<string, { label: string; variant: string }> = {
  brouillon: { label: "Brouillon", variant: "muted" },
  ouvert: { label: "Ouvert", variant: "primary" },
  en_cours: { label: "En cours", variant: "warning" },
  termine: { label: "Terminé", variant: "success" },
};

export const ROLE_LABELS: Record<string, { label: string; variant: string }> = {
  super_admin: { label: "Super Admin", variant: "danger" },
  admin: { label: "Administrateur", variant: "primary" },
  animateur: { label: "Animateur", variant: "accent" },
};

export const FORMATS = [
  { value: "speed_meeting", label: "Speed meeting", description: "Rencontres 1 à 1 minutées", icon: "⏱" },
  { value: "team", label: "Team", description: "Équipes tournantes XS à XL", icon: "👥" },
  { value: "job_dating", label: "Job dating", description: "Exposants et créneaux de passage", icon: "💼" },
];
