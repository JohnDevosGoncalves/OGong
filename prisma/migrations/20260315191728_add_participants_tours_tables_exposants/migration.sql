-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT,
    "numero" INTEGER,
    "present" BOOLEAN NOT NULL DEFAULT false,
    "evenementId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Participant_evenementId_fkey" FOREIGN KEY ("evenementId") REFERENCES "Evenement" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Table" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" INTEGER NOT NULL,
    "evenementId" TEXT NOT NULL,
    CONSTRAINT "Table_evenementId_fkey" FOREIGN KEY ("evenementId") REFERENCES "Evenement" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AffectationTable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "participantId" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    CONSTRAINT "AffectationTable_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AffectationTable_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AffectationTable_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tour" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" INTEGER NOT NULL,
    "evenementId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'en_attente',
    CONSTRAINT "Tour_evenementId_fkey" FOREIGN KEY ("evenementId") REFERENCES "Evenement" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Exposant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "societeId" TEXT NOT NULL,
    "evenementId" TEXT NOT NULL,
    CONSTRAINT "Exposant_societeId_fkey" FOREIGN KEY ("societeId") REFERENCES "Societe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Exposant_evenementId_fkey" FOREIGN KEY ("evenementId") REFERENCES "Evenement" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Creneau" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "heureDebut" TEXT NOT NULL,
    "heureFin" TEXT NOT NULL,
    "maxParticipants" INTEGER NOT NULL DEFAULT 1,
    "exposantId" TEXT NOT NULL,
    CONSTRAINT "Creneau_exposantId_fkey" FOREIGN KEY ("exposantId") REFERENCES "Exposant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InscriptionCreneau" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "participantId" TEXT NOT NULL,
    "creneauId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InscriptionCreneau_creneauId_fkey" FOREIGN KEY ("creneauId") REFERENCES "Creneau" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_EvenementAnimateurs" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_EvenementAnimateurs_A_fkey" FOREIGN KEY ("A") REFERENCES "Evenement" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_EvenementAnimateurs_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Participant_email_evenementId_key" ON "Participant"("email", "evenementId");

-- CreateIndex
CREATE UNIQUE INDEX "Table_numero_evenementId_key" ON "Table"("numero", "evenementId");

-- CreateIndex
CREATE UNIQUE INDEX "AffectationTable_participantId_tourId_key" ON "AffectationTable"("participantId", "tourId");

-- CreateIndex
CREATE UNIQUE INDEX "Tour_numero_evenementId_key" ON "Tour"("numero", "evenementId");

-- CreateIndex
CREATE UNIQUE INDEX "Exposant_societeId_evenementId_key" ON "Exposant"("societeId", "evenementId");

-- CreateIndex
CREATE UNIQUE INDEX "InscriptionCreneau_participantId_creneauId_key" ON "InscriptionCreneau"("participantId", "creneauId");

-- CreateIndex
CREATE UNIQUE INDEX "_EvenementAnimateurs_AB_unique" ON "_EvenementAnimateurs"("A", "B");

-- CreateIndex
CREATE INDEX "_EvenementAnimateurs_B_index" ON "_EvenementAnimateurs"("B");
