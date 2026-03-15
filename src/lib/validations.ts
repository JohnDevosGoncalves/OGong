import { z } from "zod";

export const createEventSchema = z.object({
  titre: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  format: z.enum(["speed_meeting", "team", "job_dating"]),
  teamSize: z.enum(["XS", "S", "M", "L", "XL"]).optional(),
  date: z.string().min(1),
  heureDebut: z.string().regex(/^\d{2}:\d{2}$/),
  heureFin: z.string().regex(/^\d{2}:\d{2}$/),
  tempsParoleTour: z.number().int().min(10).max(3600).optional(),
  tempsPauseTour: z.number().int().min(0).max(600).optional(),
  messageFin: z.string().max(2000).optional(),
});

export const updateEventSchema = createEventSchema.partial();

export const addParticipantSchema = z.object({
  nom: z.string().min(1).max(100),
  prenom: z.string().min(1).max(100),
  email: z.string().email().max(254),
  telephone: z.string().max(20).optional().nullable(),
});

export const bulkParticipantsSchema = z.array(addParticipantSchema);

export const registerSchema = z.object({
  nom: z.string().min(1).max(100),
  prenom: z.string().min(1).max(100),
  email: z.string().email().max(254),
  telephone: z.string().max(20).optional(),
  password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères"),
});

export const updateAccountSchema = z.object({
  nom: z.string().min(1).max(100).optional(),
  prenom: z.string().min(1).max(100).optional(),
  email: z.string().email().max(254).optional(),
  telephone: z.string().max(20).optional().nullable(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const inscriptionSchema = addParticipantSchema;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Adresse email invalide").max(254),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Jeton de réinitialisation requis"),
    newPassword: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères"),
    confirmPassword: z.string().min(1, "Veuillez confirmer le mot de passe"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

// ─── Collaborateurs ─────────────────────────────────────────

export const inviteCollaborateurSchema = z.object({
  email: z.string().email("Adresse email invalide").max(254),
  role: z.enum(["animateur", "co_organisateur"], {
    error: "Le rôle doit être animateur ou co-organisateur",
  }),
});

export const repondreInvitationSchema = z.object({
  invitationId: z.string().min(1, "Identifiant d'invitation requis"),
  action: z.enum(["accepter", "refuser"], {
    error: "L'action doit être accepter ou refuser",
  }),
});

// ─── Job Dating ──────────────────────────────────────────────

export const addExposantSchema = z.object({
  nom: z.string().min(1, "Le nom est requis").max(200),
  description: z.string().max(2000).optional(),
  entreprise: z.string().max(200).optional(),
  poste: z.string().max(200).optional(),
});

export const addCreneauSchema = z.object({
  exposantId: z.string().min(1, "L'exposant est requis"),
  heureDebut: z.string().regex(/^\d{2}:\d{2}$/, "Format HH:MM requis"),
  heureFin: z.string().regex(/^\d{2}:\d{2}$/, "Format HH:MM requis"),
  capacite: z.number().int().min(1).max(100).optional().default(1),
});

// ─── Team ────────────────────────────────────────────────────

export const generateTeamsSchema = z.object({
  nbEquipes: z.number().int().min(2, "Il faut au moins 2 équipes").max(50),
});

// ─── Notifications ──────────────────────────────────────────

export const sendNotificationSchema = z.object({
  type: z.enum(["reminder", "start", "results"], {
    error: "Type de notification invalide. Valeurs possibles : reminder, start, results",
  }),
});

// ─── Crédits ────────────────────────────────────────────────

export const buyCreditsSchema = z.object({
  packId: z.enum(["pack_10", "pack_25", "pack_50", "pack_100"], {
    error: "Pack de crédits invalide",
  }),
});
