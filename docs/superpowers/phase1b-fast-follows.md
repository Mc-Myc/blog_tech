# Phase 1B — fast-follows (issus de la revue finale de branche, 2026-07-11)

Les 13 tâches du Plan 1B sont livrées et mergées. Les 2 bloqueurs de la revue finale
sont corrigés (commit `e1f273d`). La majorité des fast-follows ci-dessous ont été
traités dans les commits `60863b0` (lot A : i18n + a11y) et `77067bc` (lot B :
robustesse + outillage). Statut mis à jour ci-dessous — ✅ fait / ⏳ différé.

**Fait (lots A + B)** : i18n /en (hero, état vide, méta « min read »), `aria-current` ;
proxyText 502 sur erreur réseau, feedback visuel du bouton copier, anti-flash de thème
(script inline), `steiger.config` nettoyé (lint:fsd exit 0), `vi.unstubAllGlobals`,
bump `next` 15.1.6 → 15.1.12 (CVE corrigée).

**Différé (tradeoffs / hors scope safe)** : ⏳ `<html lang>` par locale (déplacer html
dans `[locale]/layout` casse le routing 404 → vrai arbitrage SSG à faire) ; ⏳
error/loading/not-found FR sur `/en` (les route boundaries Next n'ont pas le `locale`) ;
⏳ tagline du footer FR dans SiteShell ; ⏳ `npm audit` : 8 vulns transitives (passe
supply-chain dédiée).

---
## Détail d'origine (référence)

## a11y / i18n (priorité haute)
- **`<html lang="fr">` codé en dur** (`app/layout.tsx`) → les pages `/en` s'annoncent en
  français (WCAG 3.1.1). Nécessite de descendre le `<html lang={locale}>` dans
  `app/[locale]/layout.tsx` (restructuration root/[locale]).
- **i18n partielle** : chaînes en français codées en dur qui s'affichent sur `/en` —
  hero de la home (`home-page.tsx`), état vide, `ArticleCard` « min de lecture »
  (incohérent avec `ArticleReader` qui utilise `tr.reading`), `loading/error/not-found`.
- **`aria-current="page"`** absent sur la nav active ; de plus le prop `active` de
  `SiteShell` n'est jamais passé par le layout → la classe `.on` est du code mort.

## SEO / robustesse
- **`next@15.1.6`** a une CVE connue (version épinglée par le plan) → bump patch 15.1.x.
- **`proxyText`** (`shared/api/proxy.ts`) : `fetch` sans try/catch → erreur réseau = 500
  au lieu du 502 voulu. Wrapper le fetch.

## UX / polish
- **Flash de thème** au premier paint (`toggle-theme` : `useState(false)` puis `useEffect`
  lit localStorage) → petit script inline bloquant dans le root layout qui pose
  `data-theme` avant l'hydratation.
- **`ShareBar`** : le bouton « copier le lien » n'a aucun retour visuel (toast/confirmation).

## Outillage / tests
- **Steiger `fsd/insignificant-slice`** : ~6 faux positifs car `steiger ./src` ne scanne pas
  `app/` où vivent les seuls consommateurs de plusieurs slices → `lint:fsd` n'est pas
  réellement vert. Décision honnête à prendre : désactiver la règle dans
  `steiger.config.ts` (avec rationale) ou reconfigurer le scope.
- **Nettoyage de mocks** : `vi.restoreAllMocks()` ne défait pas `vi.stubGlobal` — utiliser
  `vi.unstubAllGlobals()` dans `client.test.ts` / `proxy.test.ts`.
- **`pages/.gitkeep`** vide crée une racine Pages Router à côté de l'App Router (inoffensif,
  mais prête à confusion avec la couche FSD `src/pages`) — envisager de le retirer.
- **Redirection `/` redondante** : `middleware.ts` et `app/page.tsx` redirigent tous deux
  `/`→`/fr` ; le middleware gagne, `app/page.tsx` est mort (inoffensif).
