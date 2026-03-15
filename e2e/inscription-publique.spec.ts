import { test, expect } from '@playwright/test';

test.describe('Inscription publique a un evenement', () => {
  test('page d\'inscription publique pour un evenement inexistant affiche 404', async ({ page }) => {
    const response = await page.goto('/id-inexistant-12345/inscription');

    // La page devrait retourner un 404 ou afficher un message d'erreur
    const status = response?.status();
    const bodyText = await page.textContent('body');

    const isNotFound =
      status === 404 ||
      bodyText?.includes('404') ||
      bodyText?.toLowerCase().includes('introuvable') ||
      bodyText?.toLowerCase().includes('not found');

    expect(isNotFound).toBeTruthy();
  });
});
