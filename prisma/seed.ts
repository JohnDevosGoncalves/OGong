import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seed de la base de données OGong...\n");

  // ─── Mot de passe commun pour tous les comptes de test ────
  const password = await bcrypt.hash("Test1234", 12);
  const now = new Date();

  // ─── 1. Super Administrateur (propriétaire OGong) ──────────
  const superAdmin = await prisma.user.create({
    data: {
      nom: "Devos Goncalves",
      prenom: "John",
      email: "john@ogong.fr",
      hashedPassword: password,
      role: "super_admin",
      emailVerified: now,
    },
  });
  await prisma.credit.create({
    data: { userId: superAdmin.id, montant: 100, type: "bonus", detail: "Crédits super admin" },
  });
  console.log("✅ Super Admin : john@ogong.fr / Test1234");

  // ─── 2. Administrateur (organisateur client) ───────────────
  const admin = await prisma.user.create({
    data: {
      nom: "Dupont",
      prenom: "Marie",
      email: "marie@exemple.fr",
      hashedPassword: password,
      role: "admin",
      emailVerified: now,
    },
  });
  await prisma.credit.create({
    data: { userId: admin.id, montant: 5, type: "bonus", detail: "Crédits de bienvenue" },
  });
  console.log("✅ Admin       : marie@exemple.fr / Test1234");

  // ─── 3. Animateur (collaborateur) ──────────────────────────
  const animateur = await prisma.user.create({
    data: {
      nom: "Martin",
      prenom: "Lucas",
      email: "lucas@exemple.fr",
      hashedPassword: password,
      role: "animateur",
      emailVerified: now,
    },
  });
  await prisma.credit.create({
    data: { userId: animateur.id, montant: 5, type: "bonus", detail: "Crédits de bienvenue" },
  });
  console.log("✅ Animateur   : lucas@exemple.fr / Test1234");

  // ─── 4. Nouvel utilisateur (email non vérifié) ─────────────
  const newUser = await prisma.user.create({
    data: {
      nom: "Bernard",
      prenom: "Sophie",
      email: "sophie@exemple.fr",
      hashedPassword: password,
      role: "admin",
      emailVerified: null, // Non vérifié
    },
  });
  await prisma.credit.create({
    data: { userId: newUser.id, montant: 5, type: "bonus", detail: "Crédits de bienvenue" },
  });
  console.log("✅ Non vérifié : sophie@exemple.fr / Test1234");

  // ─── 5. Événement Speed Meeting de démo ────────────────────
  const event = await prisma.evenement.create({
    data: {
      titre: "Networking Afterwork Mars 2026",
      description: "Soirée networking avec algorithme de matching OGong. Chaque participant rencontre un maximum de personnes sans jamais croiser la même personne deux fois.",
      format: "speed_meeting",
      date: new Date("2026-03-20T18:00:00"),
      heureDebut: "18:30",
      heureFin: "20:30",
      tempsParoleTour: 180,
      tempsPauseTour: 30,
      status: "ouvert",
      messageFin: "Merci d'avoir participé ! Retrouvez vos contacts sur OGong.",
      createurId: admin.id,
    },
  });

  // Ajouter 30 participants de démo
  const prenoms = ["Alice", "Bob", "Clara", "David", "Emma", "François", "Gabrielle", "Hugo", "Inès", "Jules",
    "Karine", "Léo", "Manon", "Nathan", "Olivia", "Paul", "Quentin", "Rose", "Simon", "Tina",
    "Ugo", "Valérie", "William", "Xénia", "Yann", "Zoé", "Antoine", "Béatrice", "Clément", "Diane"];
  const noms = ["Moreau", "Leroy", "Roux", "Fournier", "Girard", "Bonnet", "Lambert", "Mercier", "Faure", "André",
    "Blanc", "Thomas", "Robert", "Garcia", "Petit", "Durand", "Morel", "Laurent", "Simon", "Michel",
    "Lefebvre", "Richard", "Legrand", "Garnier", "Chevalier", "Perrin", "Robin", "Masson", "Lemaire", "Renard"];

  for (let i = 0; i < 30; i++) {
    await prisma.participant.create({
      data: {
        nom: noms[i],
        prenom: prenoms[i],
        email: `${prenoms[i].toLowerCase()}@test.fr`,
        numero: i + 1,
        present: i < 25, // 25 présents, 5 absents
        evenementId: event.id,
      },
    });
  }
  console.log(`✅ Événement   : "${event.titre}" — 30 participants`);

  // ─── 6. Événement Job Dating de démo ───────────────────────
  const eventJD = await prisma.evenement.create({
    data: {
      titre: "Forum Emploi Tech 2026",
      description: "Rencontrez les meilleures entreprises tech de la région.",
      format: "job_dating",
      date: new Date("2026-04-10T09:00:00"),
      heureDebut: "09:00",
      heureFin: "17:00",
      tempsParoleTour: 900,
      tempsPauseTour: 60,
      status: "brouillon",
      createurId: admin.id,
    },
  });
  console.log(`✅ Événement   : "${eventJD.titre}" — job dating`);

  // ─── 7. Événement Team Building de démo ────────────────────
  const eventTeam = await prisma.evenement.create({
    data: {
      titre: "Séminaire Team Building Été 2026",
      description: "Activités de cohésion d'équipe avec rotation des groupes.",
      format: "team",
      date: new Date("2026-06-15T10:00:00"),
      heureDebut: "10:00",
      heureFin: "16:00",
      tempsParoleTour: 600,
      tempsPauseTour: 120,
      status: "brouillon",
      createurId: admin.id,
    },
  });
  console.log(`✅ Événement   : "${eventTeam.titre}" — team building`);

  // ─── 8. Collaboration : inviter l'animateur ────────────────
  await prisma.collaborateur.create({
    data: {
      role: "animateur",
      userId: animateur.id,
      evenementId: event.id,
      invitePar: admin.id,
      accepte: true,
    },
  });
  console.log("✅ Collaboration : Lucas animateur sur l'événement networking");

  // ─── Résumé ────────────────────────────────────────────────
  console.log("\n" + "═".repeat(55));
  console.log("  🎉 Base de données seedée avec succès !");
  console.log("═".repeat(55));
  console.log("\n  Comptes de test (mot de passe commun : Test1234) :\n");
  console.log("  ┌─────────────────┬──────────────────────────┬───────────────┐");
  console.log("  │ Rôle            │ Email                    │ Crédits       │");
  console.log("  ├─────────────────┼──────────────────────────┼───────────────┤");
  console.log("  │ 👑 Super Admin  │ john@ogong.fr            │ 100           │");
  console.log("  │ 🏢 Admin        │ marie@exemple.fr         │ 5             │");
  console.log("  │ 🎤 Animateur    │ lucas@exemple.fr         │ 5             │");
  console.log("  │ 🆕 Non vérifié  │ sophie@exemple.fr        │ 5             │");
  console.log("  └─────────────────┴──────────────────────────┴───────────────┘");
  console.log("\n  Événements créés :");
  console.log("  • Networking Afterwork Mars 2026 (speed_meeting, 30 participants)");
  console.log("  • Forum Emploi Tech 2026 (job_dating)");
  console.log("  • Séminaire Team Building Été 2026 (team)\n");
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
