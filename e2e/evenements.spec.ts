import { test, expect } from '@playwright/test';
import { generateTestUser, registerAndLogin } from './helpers/auth';

test.describe('Gestion des evenements (authentifie)', () => {
  test('la page evenements s\'affiche avec le message "aucun evenement" pour un nouvel utilisateur', async ({ page }) => {
    // Utiliser un utilisateur unique pour garantir qu'aucun evenement n'existe
    await registerAndLogin(page);

    await expect(page.getByRole('heading', { name: 'Événements' })).toBeVisible();
    await expect(
      page.getByText('Aucun événement pour le moment.'),
    ).toBeVisible();
  });

  test('creer un evenement avec donnees valides', async ({ page }) => {
    await registerAndLogin(page);

    await page.getByRole('link', { name: 'Créer un événement' }).click();
    await page.waitForURL('**/evenements/creer');

    await expect(
      page.getByRole('heading', { name: /Créer un/ }),
    ).toBeVisible();

    // Remplir le formulaire
    await page.getByLabel('Titre *').fill('Evenement E2E Test');
    await page.getByLabel('Description').fill('Description de test E2E');
    await page.getByLabel('Date *').fill('2026-06-15');
    await page.getByLabel('Heure de début *').fill('09:00');
    await page.getByLabel('Heure de fin *').fill('12:00');

    // Selectionner le format Speed meeting
    await page.getByRole('button', { name: /Speed meeting/ }).click();

    // Soumettre
    await page.getByRole('button', { name: "Créer l'événement" }).click();

    // Attendre la redirection vers la page de detail
    await page.waitForURL('**/evenements/**');
    await expect(page.getByText('Evenement E2E Test')).toBeVisible();
  });

  test('lister les evenements apres creation', async ({ page }) => {
    await registerAndLogin(page);

    // Creer un evenement via l'API pour garantir qu'il existe
    const eventResponse = await page.request.post('/api/evenements', {
      data: {
        titre: 'Evt Liste Test',
        format: 'speed_meeting',
        date: '2026-07-01',
        heureDebut: '10:00',
        heureFin: '12:00',
        tempsParoleTour: 120,
        tempsPauseTour: 30,
      },
    });
    expect(eventResponse.ok()).toBeTruthy();

    // Recharger la page evenements
    await page.goto('/evenements');

    await expect(page.getByText('Evt Liste Test')).toBeVisible();
  });

  test('voir le detail d\'un evenement', async ({ page }) => {
    await registerAndLogin(page);

    // Creer un evenement via l'API
    const eventResponse = await page.request.post('/api/evenements', {
      data: {
        titre: 'Evt Detail Test',
        description: 'Description detail',
        format: 'team',
        date: '2026-08-01',
        heureDebut: '14:00',
        heureFin: '16:00',
        tempsParoleTour: 120,
        tempsPauseTour: 30,
      },
    });
    expect(eventResponse.ok()).toBeTruthy();
    const event = await eventResponse.json();

    // Naviguer vers le detail
    await page.goto(`/evenements/${event.id}`);

    await expect(page.getByText('Evt Detail Test')).toBeVisible();
  });

  test('modifier un evenement via l\'API', async ({ page }) => {
    await registerAndLogin(page);

    // Creer un evenement
    const createResponse = await page.request.post('/api/evenements', {
      data: {
        titre: 'Evt Avant Modif',
        format: 'speed_meeting',
        date: '2026-09-01',
        heureDebut: '09:00',
        heureFin: '11:00',
        tempsParoleTour: 120,
        tempsPauseTour: 30,
      },
    });
    expect(createResponse.ok()).toBeTruthy();
    const event = await createResponse.json();

    // Modifier via l'API
    const patchResponse = await page.request.patch(`/api/evenements/${event.id}`, {
      data: { titre: 'Evt Apres Modif' },
    });
    expect(patchResponse.ok()).toBeTruthy();

    const updated = await patchResponse.json();
    expect(updated.titre).toBe('Evt Apres Modif');

    // Verifier sur la page de detail
    await page.goto(`/evenements/${event.id}`);
    await expect(page.getByText('Evt Apres Modif')).toBeVisible();
  });

  test('supprimer un evenement via l\'API', async ({ page }) => {
    await registerAndLogin(page);

    // Creer un evenement
    const createResponse = await page.request.post('/api/evenements', {
      data: {
        titre: 'Evt A Supprimer',
        format: 'speed_meeting',
        date: '2026-10-01',
        heureDebut: '09:00',
        heureFin: '11:00',
        tempsParoleTour: 120,
        tempsPauseTour: 30,
      },
    });
    expect(createResponse.ok()).toBeTruthy();
    const event = await createResponse.json();

    // Supprimer via l'API
    const deleteResponse = await page.request.delete(`/api/evenements/${event.id}`);
    expect(deleteResponse.ok()).toBeTruthy();

    // Verifier que l'evenement n'existe plus
    const getResponse = await page.request.get(`/api/evenements/${event.id}`);
    expect(getResponse.status()).toBe(404);
  });
});
