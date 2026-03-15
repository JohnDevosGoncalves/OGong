/**
 * Algorithme de matching parfait OGong
 *
 * Approche : tables de matching pré-calculées par construction mathématique.
 * Basé sur l'arithmétique modulaire dans Z_T (T premier).
 *
 * Formule : au tour r, le siège s va à la table (s % T + r × ⌊s/T⌋) % T
 *
 * Propriété : deux sièges (a₁,b₁) et (a₂,b₂) avec b₁≠b₂ se retrouvent
 * à la même table dans exactement 1 tour sur T. Garanti sans doublon.
 *
 * Pour les nombres de participants "imparfaits", on ajoute des places
 * fantômes pour atteindre T×k (T premier × taille de table).
 */

// ─── Types ──────────────────────────────────────────────────

export interface TableAssignment {
  tableNumero: number;
  participantIds: string[];
}

export interface TourAssignment {
  tourNumero: number;
  tables: TableAssignment[];
}

export interface AlgorithmeResult {
  tours: TourAssignment[];
  maxToursAtteint: boolean;
  stats: {
    totalRencontres: number;
    rencontresParPersonne: number;
    tauxCouverture: number;
  };
}

/** Configuration d'un matching parfait */
export interface MatchingConfig {
  /** Nombre réel de participants */
  nbParticipants: number;
  /** Nombre effectif de sièges (participants + fantômes) */
  nbSieges: number;
  /** Nombre de tables (toujours premier) */
  nbTables: number;
  /** Taille de chaque table */
  tailleTable: number;
  /** Nombre de sièges fantômes (places vides) */
  phantoms: number;
  /** Nombre maximum de tours sans doublon */
  maxTours: number;
  /** Rencontres par personne par tour */
  rencontresParTour: number;
}

// ─── Nombres premiers utiles ────────────────────────────────

const PRIMES = [
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79,
];

function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
}

function nextPrime(n: number): number {
  let p = n;
  while (!isPrime(p)) p++;
  return p;
}

// ─── Calcul de la configuration optimale ────────────────────

/**
 * Pour un nombre N de participants (20–150), trouve la meilleure
 * configuration (k, T) telle que :
 * - T est premier (garantie mathématique)
 * - T × k ≥ N (assez de sièges)
 * - T × k − N est minimal (peu de fantômes)
 * - k est entre 4 et 12 (taille de table raisonnable)
 * - T ≥ 3 (au moins 3 tours)
 */
export function trouverConfig(nbParticipants: number): MatchingConfig {
  let best: MatchingConfig | null = null;
  let bestScore = -Infinity;

  for (let k = 4; k <= 12; k++) {
    const Tmin = Math.max(k, Math.ceil(nbParticipants / k)); // T >= k obligatoire !
    const T = nextPrime(Tmin);
    const nbSieges = T * k;
    const phantoms = nbSieges - nbParticipants;

    // Ne pas accepter trop de fantômes (max ~30% d'une table)
    if (phantoms > Math.ceil(k * 1.5)) continue;
    // Ne pas accepter des configs absurdes
    if (T > 40) continue;
    // Contrainte mathématique : k <= T pour que la construction Z_T fonctionne
    if (k > T) continue;

    const maxTours = T;
    const rencontresParTour = k - 1;
    const totalMeetingsMax = maxTours * rencontresParTour;
    const totalPairsPossibles = (nbParticipants * (nbParticipants - 1)) / 2;
    const meetingsCoverage = Math.min(1, (nbParticipants * totalMeetingsMax / 2) / totalPairsPossibles);

    // Score : favoriser couverture élevée et tables de bonne taille (6-10)
    // Plus la table est grande, plus on fait de rencontres par tour → événement plus court
    const score =
      meetingsCoverage * 1000 +
      rencontresParTour * 80 -   // favoriser plus de rencontres par tour
      phantoms * 40 -
      (maxTours > 15 ? (maxTours - 15) * 20 : 0) - // pénaliser trop de tours
      Math.abs(k - 8) * 5; // préférer tables autour de 8

    if (score > bestScore) {
      bestScore = score;
      best = {
        nbParticipants,
        nbSieges,
        nbTables: T,
        tailleTable: k,
        phantoms,
        maxTours,
        rencontresParTour,
      };
    }
  }

  // Fallback
  if (!best) {
    const k = 6;
    const T = nextPrime(Math.ceil(nbParticipants / k));
    return {
      nbParticipants,
      nbSieges: T * k,
      nbTables: T,
      tailleTable: k,
      phantoms: T * k - nbParticipants,
      maxTours: T,
      rencontresParTour: k - 1,
    };
  }

  return best;
}

// ─── Formule de placement (cœur mathématique) ───────────────

/**
 * Détermine la table d'un siège donné pour un tour donné.
 *
 * Formule : table = (siege % T + tour × ⌊siege / T⌋) % T
 *
 * Où T = nombre de tables (premier), siege = numéro 0-indexé, tour = 0-indexé.
 *
 * Propriété prouvée : deux sièges (a₁,b₁) et (a₂,b₂) avec b₁ ≠ b₂
 * partagent la même table dans exactement 1 tour. Aucun doublon possible.
 */
export function tableForSiege(siege: number, tour: number, T: number): number {
  const a = siege % T;        // "colonne" du siège
  const b = Math.floor(siege / T); // "ligne" du siège
  return ((a + tour * b) % T + T) % T; // modulo positif
}

// ─── Génération des tours ───────────────────────────────────

/**
 * Génère tous les tours pour une configuration donnée.
 * Les sièges fantômes (>= nbParticipants) sont exclus des tables.
 */
export function genererToursFromConfig(
  config: MatchingConfig,
  participantIds: string[]
): TourAssignment[] {
  const { nbSieges, nbTables: T, tailleTable: k, maxTours } = config;
  const tours: TourAssignment[] = [];

  for (let r = 0; r < maxTours; r++) {
    const tables: string[][] = Array.from({ length: T }, () => []);

    for (let s = 0; s < nbSieges; s++) {
      const t = tableForSiege(s, r, T);

      // Ne placer que les vrais participants (pas les fantômes)
      if (s < participantIds.length) {
        tables[t].push(participantIds[s]);
      }
    }

    tours.push({
      tourNumero: r + 1,
      tables: tables
        .map((ids, idx) => ({ tableNumero: idx + 1, participantIds: ids }))
        .filter((t) => t.participantIds.length > 0), // exclure tables vides
    });
  }

  return tours;
}

/**
 * Valide qu'un set de tours n'a aucun doublon.
 * Retourne le nombre de doublons trouvés (0 = parfait).
 */
export function validerTours(tours: TourAssignment[]): {
  doublons: number;
  pairesUniques: number;
} {
  const pairesVues = new Set<string>();
  let doublons = 0;

  for (const tour of tours) {
    for (const table of tour.tables) {
      const ids = table.participantIds;
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          const key = ids[i] < ids[j] ? `${ids[i]}|${ids[j]}` : `${ids[j]}|${ids[i]}`;
          if (pairesVues.has(key)) doublons++;
          else pairesVues.add(key);
        }
      }
    }
  }

  return { doublons, pairesUniques: pairesVues.size };
}

// ─── Point d'entrée principal ───────────────────────────────

/**
 * Calcule les affectations optimales pour un groupe de participants.
 *
 * @param participantIds - IDs des participants inscrits
 * @param nbTours - Nombre de tours souhaité (optionnel, max par défaut)
 */
export function calculerAffectations(
  participantIds: string[],
  _format?: string,
  _nbTables?: number,
  nbTours?: number
): AlgorithmeResult {
  const N = participantIds.length;
  if (N < 2) {
    return {
      tours: [],
      maxToursAtteint: true,
      stats: { totalRencontres: 0, rencontresParPersonne: 0, tauxCouverture: 0 },
    };
  }

  const config = trouverConfig(N);
  const maxToursEffectif = nbTours ? Math.min(nbTours, config.maxTours) : config.maxTours;
  const configAjuste = { ...config, maxTours: maxToursEffectif };

  const tours = genererToursFromConfig(configAjuste, participantIds);
  const { pairesUniques } = validerTours(tours);

  const totalPairesPossibles = (N * (N - 1)) / 2;
  const tauxCouverture = totalPairesPossibles > 0
    ? Math.round((pairesUniques / totalPairesPossibles) * 10000) / 100
    : 0;
  const rencontresParPersonne = N > 0 ? Math.round((pairesUniques * 2) / N) : 0;

  return {
    tours,
    maxToursAtteint: maxToursEffectif >= config.maxTours,
    stats: {
      totalRencontres: pairesUniques,
      rencontresParPersonne,
      tauxCouverture,
    },
  };
}

// ─── Table de référence pré-calculée (20–150) ───────────────

/**
 * Retourne la configuration pré-calculée pour un nombre de participants.
 * Inclut : nombre de tables, taille, phantômes, max tours.
 */
export function getConfigReference(nbParticipants: number): MatchingConfig & {
  description: string;
} {
  const config = trouverConfig(nbParticipants);
  const phantomNote = config.phantoms > 0
    ? ` (${config.phantoms} place${config.phantoms > 1 ? "s" : ""} vide${config.phantoms > 1 ? "s" : ""})`
    : "";

  return {
    ...config,
    description:
      `${config.nbParticipants} participants → ${config.nbTables} tables de ${config.tailleTable}${phantomNote}, ` +
      `${config.maxTours} tours max, ${config.rencontresParTour} rencontres/tour/personne`,
  };
}

/**
 * Affiche toutes les configurations de 20 à 150 participants.
 */
export function afficherTableReference(): string {
  const lines: string[] = [
    "╔═════════════╦════════╦════════════╦══════════╦═══════╦══════════════════╗",
    "║ Participants ║ Tables ║ Taille tab ║ Fantômes ║ Tours ║ Renc./tour/pers. ║",
    "╠═════════════╬════════╬════════════╬══════════╬═══════╬══════════════════╣",
  ];

  for (let n = 20; n <= 150; n += 5) {
    const c = trouverConfig(n);
    lines.push(
      `║ ${String(n).padStart(11)} ║ ${String(c.nbTables).padStart(6)} ║ ${String(c.tailleTable).padStart(10)} ║ ${String(c.phantoms).padStart(8)} ║ ${String(c.maxTours).padStart(5)} ║ ${String(c.rencontresParTour).padStart(16)} ║`
    );
  }

  lines.push(
    "╚═════════════╩════════╩════════════╩══════════╩═══════╩══════════════════╝"
  );

  return lines.join("\n");
}
