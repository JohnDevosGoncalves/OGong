import { type Page, expect } from '@playwright/test';

export interface TestUser {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  password: string;
}

/**
 * Genere un utilisateur de test unique grace a un timestamp.
 */
export function generateTestUser(): TestUser {
  const uid = Date.now();
  return {
    nom: 'TestNom',
    prenom: 'TestPrenom',
    email: `test-e2e-${uid}@exemple.fr`,
    telephone: '0612345678',
    password: 'MotDePasse123!',
  };
}

/**
 * Inscrit un utilisateur de test via l'API /api/auth/register.
 * Retourne true si le compte a ete cree, false s'il existait deja (409).
 * Leve une erreur pour tout autre code HTTP inattendu.
 */
export async function registerUserViaApi(
  page: Page,
  user: TestUser,
): Promise<boolean> {
  const response = await page.request.post('/api/auth/register', {
    data: {
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone,
      password: user.password,
    },
  });

  if (response.ok()) return true;
  if (response.status() === 409) return false; // compte deja existant

  throw new Error(`Echec inscription: ${response.status()} ${await response.text()}`);
}

/**
 * Connecte un utilisateur via le formulaire de connexion et attend
 * la redirection vers /evenements.
 */
export async function loginViaUi(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/connexion');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Mot de passe').fill(password);
  await page.getByRole('button', { name: 'Connexion' }).click();
  await page.waitForURL('**/evenements');
}

/**
 * Inscrit un utilisateur via l'API puis le connecte via l'interface.
 * Combine registerUserViaApi + loginViaUi pour simplifier les tests authentifies.
 */
export async function registerAndLogin(page: Page, user?: TestUser): Promise<TestUser> {
  const testUser = user ?? generateTestUser();
  await registerUserViaApi(page, testUser);
  await loginViaUi(page, testUser.email, testUser.password);
  return testUser;
}
