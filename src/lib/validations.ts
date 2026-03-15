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
