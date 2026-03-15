import {
  trouverConfig,
  tableForSiege,
  genererToursFromConfig,
  validerTours,
  calculerAffectations,
  getConfigReference,
} from "../algorithme";

// Helpers
function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function createParticipants(n: number): string[] {
  return Array.from({ length: n }, (_, i) => `p${i + 1}`);
}

// ─── Configuration ──────────────────────────────────────────

describe("trouverConfig", () => {
  test("respecte toujours k ≤ T (contrainte mathématique)", () => {
    for (let n = 20; n <= 150; n++) {
      const config = trouverConfig(n);
      expect(config.tailleTable).toBeLessThanOrEqual(config.nbTables);
    }
  });

  test("nbSieges = nbTables × tailleTable", () => {
    for (let n = 20; n <= 150; n += 10) {
      const config = trouverConfig(n);
      expect(config.nbSieges).toBe(config.nbTables * config.tailleTable);
    }
  });

  test("nbSieges ≥ nbParticipants", () => {
    for (let n = 20; n <= 150; n += 10) {
      const config = trouverConfig(n);
      expect(config.nbSieges).toBeGreaterThanOrEqual(n);
    }
  });

  test("phantoms = nbSieges - nbParticipants", () => {
    for (let n = 20; n <= 150; n += 10) {
      const config = trouverConfig(n);
      expect(config.phantoms).toBe(config.nbSieges - n);
    }
  });

  test("47 participants → config valide avec tables raisonnables", () => {
    const config = trouverConfig(47);
    expect(config.nbParticipants).toBe(47);
    expect(config.tailleTable).toBeGreaterThanOrEqual(4);
    expect(config.tailleTable).toBeLessThanOrEqual(12);
    expect(config.tailleTable).toBeLessThanOrEqual(config.nbTables);
  });
});

// ─── Formule de placement ───────────────────────────────────

describe("tableForSiege", () => {
  test("siège 0 est toujours à la table 0 (b=0 → tour×0=0)", () => {
    for (let r = 0; r < 10; r++) {
      expect(tableForSiege(0, r, 7)).toBe(0);
    }
  });

  test("au tour 0, siège s va à la table s % T", () => {
    const T = 7;
    for (let s = 0; s < 20; s++) {
      expect(tableForSiege(s, 0, T)).toBe(s % T);
    }
  });

  test("résultat toujours dans [0, T-1]", () => {
    const T = 13;
    for (let s = 0; s < 100; s++) {
      for (let r = 0; r < T; r++) {
        const t = tableForSiege(s, r, T);
        expect(t).toBeGreaterThanOrEqual(0);
        expect(t).toBeLessThan(T);
      }
    }
  });
});

// ─── Zéro doublon garanti ───────────────────────────────────

describe("genererToursFromConfig — zéro doublon", () => {
  const testCases = [20, 30, 47, 50, 80, 100, 120, 150];

  test.each(testCases)("%i participants → 0 doublons", (n) => {
    const config = trouverConfig(n);
    const ids = createParticipants(n);
    const tours = genererToursFromConfig(config, ids);
    const { doublons } = validerTours(tours);

    expect(doublons).toBe(0);
  });
});

describe("genererToursFromConfig — tous les participants assignés", () => {
  test("47 participants : chaque tour contient tous les participants", () => {
    const config = trouverConfig(47);
    const participants = createParticipants(47);
    const tours = genererToursFromConfig(config, participants);

    for (const tour of tours) {
      const allIds = tour.tables.flatMap((t) => t.participantIds).sort();
      expect(allIds).toEqual([...participants].sort());
    }
  });

  test("100 participants : chaque tour contient tous les participants", () => {
    const config = trouverConfig(100);
    const participants = createParticipants(100);
    const tours = genererToursFromConfig(config, participants);

    for (const tour of tours) {
      const allIds = tour.tables.flatMap((t) => t.participantIds).sort();
      expect(allIds).toEqual([...participants].sort());
    }
  });
});

// ─── Exhaustif 20-150 ───────────────────────────────────────

describe("validation exhaustive 20-150 participants", () => {
  test("0 doublons pour toute taille de 20 à 150", () => {
    for (let n = 20; n <= 150; n++) {
      const config = trouverConfig(n);
      const ids = createParticipants(n);
      const tours = genererToursFromConfig(config, ids);
      const { doublons } = validerTours(tours);

      if (doublons > 0) {
        fail(
          `N=${n}: ${doublons} doublons (T=${config.nbTables}, k=${config.tailleTable})`
        );
      }
    }
  });
});

// ─── calculerAffectations (point d'entrée) ──────────────────

describe("calculerAffectations", () => {
  test("47 participants → stats cohérentes", () => {
    const participants = createParticipants(47);
    const result = calculerAffectations(participants);

    expect(result.tours.length).toBeGreaterThanOrEqual(3);
    expect(result.stats.totalRencontres).toBeGreaterThan(0);
    expect(result.stats.rencontresParPersonne).toBeGreaterThan(0);
    expect(result.stats.tauxCouverture).toBeGreaterThan(0);
    expect(result.stats.tauxCouverture).toBeLessThanOrEqual(100);
  });

  test("2 participants → 1 tour, 1 rencontre", () => {
    const participants = createParticipants(2);
    const result = calculerAffectations(participants);

    expect(result.stats.totalRencontres).toBeGreaterThanOrEqual(1);
  });

  test("1 participant → aucun tour", () => {
    const result = calculerAffectations(["p1"]);
    expect(result.tours).toHaveLength(0);
    expect(result.stats.totalRencontres).toBe(0);
  });

  test("nbTours limité → respecte la limite", () => {
    const participants = createParticipants(50);
    const result = calculerAffectations(participants, undefined, undefined, 3);

    expect(result.tours.length).toBe(3);
    expect(result.maxToursAtteint).toBe(false);
  });

  test("100 participants → couverture > 80%", () => {
    const participants = createParticipants(100);
    const result = calculerAffectations(participants);

    expect(result.stats.tauxCouverture).toBeGreaterThan(80);
  });
});

// ─── getConfigReference ─────────────────────────────────────

describe("getConfigReference", () => {
  test("retourne une description lisible", () => {
    const ref = getConfigReference(47);
    expect(ref.description).toContain("47 participants");
    expect(ref.description).toContain("tables de");
    expect(ref.description).toContain("tours max");
  });
});
