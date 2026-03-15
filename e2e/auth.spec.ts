import { test, expect } from '@playwright/test';
import { generateTestUser, registerUserViaApi } from './helpers/auth';

test.describe('Authentification', () => {
  test('la page de connexion s\'affiche correctement', async ({ page }) => {
    await page.goto('/connexion');

    await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Mot de passe')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Connexion' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Créer un compte' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Mot de passe oublié ?' })).toBeVisible();
  });

  test('connexion avec identifiants invalides affiche une erreur', async ({ page }) => {
    await page.goto('/connexion');

    await page.getByLabel('Email').fill('inexistant@exemple.fr');
    await page.getByLabel('Mot de passe').fill('mauvais-mot-de-passe');
    await page.getByRole('button', { name: 'Connexion' }).click();

    await expect(page.getByText('Email ou mot de passe incorrect.')).toBeVisible();
  });

  test('la page de creation de compte s\'affiche correctement', async ({ page }) => {
    await page.goto('/inscription');

    await expect(page.getByRole('heading', { name: 'Création de compte' })).toBeVisible();
    await expect(page.getByLabel('Nom')).toBeVisible();
    await expect(page.getByLabel('Prénom')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Téléphone')).toBeVisible();
    await expect(page.getByLabel('Mot de passe', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Répéter le mot de passe')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Créer mon compte' })).toBeVisible();
  });

  test('inscription avec email deja existant affiche une erreur', async ({ page }) => {
    const user = generateTestUser();

    // Creer un premier compte via l'API
    await registerUserViaApi(page, user);

    // Tenter de s'inscrire avec le meme email via l'interface
    await page.goto('/inscription');

    await page.getByLabel('Nom').fill(user.nom);
    await page.getByLabel('Prénom').fill(user.prenom);
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Mot de passe', { exact: true }).fill(user.password);
    await page.getByLabel('Répéter le mot de passe').fill(user.password);
    await page.getByRole('button', { name: 'Créer mon compte' }).click();

    await expect(page.getByText('Un compte existe déjà avec cet email.')).toBeVisible();
  });

  test('redirection vers /connexion si non authentifie sur /evenements', async ({ page }) => {
    await page.goto('/evenements');

    await page.waitForURL('**/connexion**');
    await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible();
  });
});
