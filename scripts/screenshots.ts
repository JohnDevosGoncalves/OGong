/**
 * Script de capture d'écran OGong pour le site vitrine
 * Usage: npx tsx scripts/screenshots.ts
 * Prérequis: npx playwright install chromium
 */
import { chromium } from "@playwright/test";
import path from "path";
import fs from "fs";

const OUTPUT_DIR = path.resolve(
  __dirname,
  "../../OGong_Vitrine/public/screenshots"
);
const BASE_URL = "http://localhost:3000";

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: "light",
  });
  const page = await context.newPage();

  // 1. Page de connexion
  console.log("📸 Page de connexion...");
  await page.goto(`${BASE_URL}/connexion`);
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: path.join(OUTPUT_DIR, "connexion.png") });

  // 2. Page d'inscription
  console.log("📸 Page d'inscription...");
  await page.goto(`${BASE_URL}/inscription`);
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: path.join(OUTPUT_DIR, "inscription.png") });

  // 3. Login as Marie (organisatrice)
  console.log("🔐 Connexion Marie...");
  await page.goto(`${BASE_URL}/connexion`);
  await page.waitForLoadState("networkidle");
  await page.fill('input[name="email"], input[type="email"]', "marie@exemple.fr");
  await page.fill('input[name="password"], input[type="password"]', "Test1234");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/evenements**", { timeout: 15000 });
  await page.waitForLoadState("networkidle");

  // 4. Dashboard événements
  console.log("📸 Dashboard événements...");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, "dashboard-evenements.png") });

  // 5. Détail événement (Networking Afterwork)
  console.log("📸 Détail événement...");
  const voirLink = page.locator('a:has-text("Voir")').last();
  await voirLink.click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, "detail-evenement.png") });

  // 6. Statistiques
  console.log("📸 Statistiques...");
  await page.goto(`${BASE_URL}/statistiques`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, "statistiques.png") });

  // 7. Créer un événement
  console.log("📸 Créer événement...");
  await page.goto(`${BASE_URL}/evenements/creer`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, "creer-evenement.png") });

  // 8. Page crédits
  console.log("📸 Crédits...");
  await page.goto(`${BASE_URL}/credits`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, "credits.png") });

  // 9. Page aide
  console.log("📸 Aide...");
  await page.goto(`${BASE_URL}/aide`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, "aide.png") });

  // 10. Déconnexion + Login Super Admin
  console.log("🔐 Connexion Super Admin...");
  await page.goto(`${BASE_URL}/api/auth/signout`);
  await page.waitForLoadState("networkidle");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/connexion**", { timeout: 15000 });
  await page.fill('input[name="email"], input[type="email"]', "john@ogong.fr");
  await page.fill('input[name="password"], input[type="password"]', "Test1234");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/evenements**", { timeout: 15000 });
  await page.waitForLoadState("networkidle");

  // 11. Dashboard Admin
  console.log("📸 Admin dashboard...");
  await page.goto(`${BASE_URL}/admin`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUTPUT_DIR, "admin-dashboard.png") });

  // 12. Admin utilisateurs
  console.log("📸 Admin utilisateurs...");
  await page.goto(`${BASE_URL}/admin/utilisateurs`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, "admin-utilisateurs.png") });

  await browser.close();

  const files = fs.readdirSync(OUTPUT_DIR);
  console.log(`\n✅ ${files.length} screenshots sauvegardés dans ${OUTPUT_DIR}/`);
  files.forEach((f) => console.log(`   📄 ${f}`));
}

main().catch((err) => {
  console.error("❌ Erreur:", err);
  process.exit(1);
});
