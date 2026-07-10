import { test, expect } from "@playwright/test";

test("/ redirige vers /fr", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/fr$/);
});

test("home liste des articles seedés", async ({ page }) => {
  await page.goto("/fr");
  await expect(page.getByRole("link", { name: /singleton/i })).toBeVisible();
});

test("clic sur un article ouvre sa page", async ({ page }) => {
  await page.goto("/fr");
  await page.getByRole("link", { name: /singleton/i }).first().click();
  await expect(page).toHaveURL(/\/fr\/articles\//);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("recherche trouve le singleton", async ({ page }) => {
  await page.goto("/fr/search?q=singleton");
  await expect(page.getByRole("link", { name: /singleton/i })).toBeVisible();
});

test("un slug inexistant rend une 404", async ({ page }) => {
  const res = await page.goto("/fr/articles/nexiste-pas");
  expect(res?.status()).toBe(404);
  await expect(page.getByText(/introuvable/i)).toBeVisible();
});

test("la nav reste utilisable en mobile (375px)", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/fr");
  await expect(page.getByRole("link", { name: /blog/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Recherche|Search/ })).toBeVisible();
});

test("/sitemap.xml est servi (pas avalé par le middleware)", async ({ page }) => {
  const res = await page.goto("/sitemap.xml");
  expect(res?.status()).toBe(200);
  expect(await page.content()).toContain("urlset");
});

test("/robots.txt est servi et pointe le sitemap", async ({ page }) => {
  const res = await page.goto("/robots.txt");
  expect(res?.status()).toBe(200);
  expect(await page.content()).toContain("Sitemap");
});
