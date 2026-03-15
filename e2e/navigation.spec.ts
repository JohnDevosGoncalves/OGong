import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('la page d\'accueil redirige vers /connexion', async ({ page }) => {
    await page.goto('/');

    await page.waitForURL('**/connexion**');
    await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible();
  });

  test('le lien "Creer un compte" mene a la page d\'inscription', async ({ page }) => {
    await page.goto('/connexion');

    await page.getByRole('link', { name: 'Créer un compte' }).click();

    await page.waitForURL('**/inscription');
    await expect(page.getByRole('heading', { name: 'Création de compte' })).toBeVisible();
  });

  test('le lien "Se connecter" mene a la page de connexion', async ({ page }) => {
    await page.goto('/inscription');

    await page.getByRole('link', { name: 'Se connecter' }).click();

    await page.waitForURL('**/connexion');
    await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible();
  });

  test('le lien "Mot de passe oublie" mene a la bonne page', async ({ page }) => {
    await page.goto('/connexion');

    await page.getByRole('link', { name: 'Mot de passe oublié ?' }).click();

    await page.waitForURL('**/mot-de-passe-oublie');
  });
});
