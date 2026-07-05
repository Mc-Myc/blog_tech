# Phase 1B — Frontend Next.js FSD (blog public) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Blog public Next.js — pages home / article / recherche, branchées sur l'API DRF `/api/v1/` livrée en Phase 1A, avec le design « terminal & encre » du prototype et l'i18n `[locale]`. Objectif Phase 1 atteint : le premier article visible côté lecteur.

**Architecture:** Next.js 15 App Router + Feature-Sliced Design. `app/` = wrappers minces qui re-exportent depuis `src/pages/`. Couches FSD `pages → widgets → features → entities → shared`, imports strictement descendants, un `index.ts` public par slice, Steiger en CI. Fetches côté serveur (RSC/ISR) vers Django — pas de CORS. Le rendu 3D des articles `code_3d` est **hors périmètre** (Phase 4) : en Phase 1B un article `code_3d` s'affiche comme un article standard (son `body_mdx`) + un encart « scène 3D à venir ».

**Tech Stack:** Next.js 15, React 19, TypeScript strict, react-markdown + remark-gfm + rehype-highlight, next/font, Vitest + Testing Library (jsdom), Playwright, Steiger (lint FSD), zod.

## Global Constraints

- ⚠️ Le dossier projet est `/Users/marcelyapo/Sites/Django_nexjs/blog_tech ` **avec un espace final** : TOUJOURS quoter les chemins shell.
- Racine frontend : `frontend/` (le backend Django vit dans `backend/`, déjà livré).
- **FSD strict** : imports uniquement descendants `pages → widgets → features → entities → shared` ; jamais latéraux ni montants ; chaque slice exporté via son `index.ts` ; `app/` ne contient que des re-exports + câblage framework. Steiger doit passer.
- Alias TypeScript : `@/*` → `./src/*`.
- **API** : base lue via `process.env.API_URL` (défaut `http://127.0.0.1:8000/api/v1`). Fetches côté serveur uniquement (jamais exposer l'URL au client en Phase 1). Contrat exact (vérifié live le 2026-07-05) :
  - `GET /articles/?locale=&kind=&tag=` → `{count, next, previous, results: [{slug, locale, kind, title, excerpt, reading_time, published_at, tags: string[]}]}`
  - `GET /articles/<slug>/?locale=` → liste + `{body_mdx, scene: object|null, series: string|null}`
  - `GET /series/` → `{count, results: [{slug, title}]}`
  - `GET /search/?q=&locale=` → même forme que `/articles/`
- **i18n** : locales `fr` (défaut) | `en` ; toutes les URLs publiques préfixées `/<locale>/…` ; `/` redirige vers `/fr`.
- `kind` ∈ `standard` | `code_3d` | `til`. En Phase 1B, `code_3d` et `til` se rendent comme `standard` (pas de 3D).
- Design : reprendre les tokens de `../prototype/proto.css` (fond charbon `#101418`, accent argile `#e8724c`, jaune `#f2c94c`, encre `#e9e4da`). Polices via next/font : Fraunces (display), Source Serif 4 (corps), IBM Plex Mono (code), IBM Plex Sans (UI).
- Tests : `npm test` (Vitest) depuis `frontend/` ; smoke Playwright `npm run e2e` (nécessite Django lancé sur `:8000` + `next dev`).
- Commits : préfixes `feat:`/`test:`/`chore:` ; un commit par tâche minimum.
- Node 20.19 disponible ; pas de Docker.

---

### Task 1: Bootstrap Next.js + FSD skeleton + tooling + design tokens

**Files:**
- Create: `frontend/package.json`, `frontend/tsconfig.json`, `frontend/next.config.ts`, `frontend/vitest.config.ts`, `frontend/vitest.setup.ts`, `frontend/steiger.config.ts`, `frontend/.gitignore`, `frontend/next-env.d.ts`
- Create: `frontend/pages/.gitkeep` (shadow anti-Pages-Router)
- Create: `frontend/app/layout.tsx`, `frontend/app/globals.css`, `frontend/app/page.tsx`
- Create: `frontend/src/shared/config/index.ts`
- Test: `frontend/src/shared/config/config.test.ts`

**Interfaces:**
- Produces: alias `@/*`→`src/*` ; `frontend/app/globals.css` avec les CSS variables du design ; `src/shared/config` exportant `SITE_NAME: string`, `LOCALES: readonly ["fr","en"]`, `DEFAULT_LOCALE: "fr"`, `isLocale(x: string): x is Locale`, type `Locale`.

- [ ] **Step 1: Créer le projet et les dépendances**

`frontend/package.json` :
```json
{
  "name": "blog-tech-frontend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint:fsd": "steiger ./src",
    "e2e": "playwright test"
  },
  "dependencies": {
    "next": "15.1.6",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "react-markdown": "9.0.1",
    "remark-gfm": "4.0.0",
    "rehype-highlight": "7.0.1",
    "zod": "3.24.1"
  },
  "devDependencies": {
    "@playwright/test": "1.49.1",
    "@testing-library/jest-dom": "6.6.3",
    "@testing-library/react": "16.1.0",
    "@types/node": "22.10.5",
    "@types/react": "19.0.7",
    "@types/react-dom": "19.0.3",
    "@vitejs/plugin-react": "4.3.4",
    "jsdom": "25.0.1",
    "steiger": "0.5.7",
    "typescript": "5.7.3",
    "vitest": "2.1.8"
  }
}
```

`frontend/tsconfig.json` :
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`frontend/next.config.ts` :
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
```

`frontend/next-env.d.ts` :
```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
```

`frontend/.gitignore` :
```
/node_modules
/.next
/out
/playwright-report
/test-results
next-env.d.ts
.env*.local
```

`frontend/pages/.gitkeep` : fichier vide (empêche Next de scanner `src/pages` comme Pages Router — le dossier racine `pages/` vide masque `src/pages`).

- [ ] **Step 2: Config Vitest + Steiger**

`frontend/vitest.config.ts` :
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
```

`frontend/vitest.setup.ts` :
```ts
import "@testing-library/jest-dom/vitest";
```

`frontend/steiger.config.ts` :
```ts
import { defineConfig } from "steiger";
import fsd from "@feature-sliced/steiger-plugin";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    files: ["./src/shared/**"],
    rules: { "fsd/public-api": "off" },
  },
]);
```
(Note : `@feature-sliced/steiger-plugin` est fourni par `steiger`. Si l'import échoue, remplacer par `import { fsd } from "steiger"` et adapter — vérifier au run de `npm run lint:fsd`.)

- [ ] **Step 3: Design tokens + layout racine**

`frontend/app/globals.css` (tokens portés de `prototype/proto.css`) :
```css
:root {
  --bg: #101418;
  --bg-deep: #0b0e11;
  --surface: #171d24;
  --surface-2: #1e252e;
  --line: #2a333d;
  --ink: #e9e4da;
  --ink-strong: #f7f3ea;
  --muted: #8b949e;
  --accent: #e8724c;
  --accent-soft: #e8724c22;
  --hand: #f2c94c;
  --ok: #7ec46a;
  --info: #6cb6ff;
  --danger: #e5534b;              /* états d'erreur (token sémantique) */
  --danger-soft: #e5534b1e;
  /* échelle d'espacement (base 4) — les composants consomment ces tokens, pas des px bruts */
  --sp-1: 4px; --sp-2: 8px; --sp-3: 12px; --sp-4: 16px; --sp-5: 24px;
  --sp-6: 32px; --sp-7: 48px; --sp-8: 64px;
  /* durées + courbes de motion (tokens, cf. motion-principles) */
  --dur-fast: 120ms; --dur-base: 250ms; --dur-slow: 350ms;
  --ease-out: cubic-bezier(.2,.8,.3,1); --ease-standard: cubic-bezier(.4,0,.2,1);
  --tap: 44px;                    /* cible tactile minimale */
  --max: 1120px;
  --measure: 68ch;
}
[data-theme="light"] {
  --bg: #f4efe6; --bg-deep: #ebe4d6; --surface: #fbf8f1; --surface-2: #f1ebdf;
  --line: #d9d0bd; --ink: #2a2f36; --ink-strong: #14181d; --muted: #5c646d;
  --accent: #cf5b35; --accent-soft: #cf5b3522; --hand: #a97b12; --danger: #c0392b;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-ui), system-ui, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  min-height: 100vh;
}
a { color: inherit; text-decoration: none; }
::selection { background: var(--accent); color: var(--bg-deep); }
.wrap { max-width: var(--max); margin: 0 auto; padding: 0 24px; }
/* focus visible cohérent partout (a11y — remplace le ring par défaut peu visible sur fond charbon) */
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 3px; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }
}
```

> Note tokens (skill `design-tokens`) : `--muted` clair est passé de `#6d7681` à
> `#5c646d` pour tenir le contraste AA (4.5:1) sur `--surface` clair. Vérifier au
> build les paires méta/fond dans les deux thèmes.

`frontend/app/layout.tsx` :
```tsx
import type { Metadata } from "next";
import { Fraunces, Source_Serif_4, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const display = Fraunces({ subsets: ["latin"], variable: "--font-display", weight: ["400", "700", "900"] });
const body = Source_Serif_4({ subsets: ["latin"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "500", "600"] });
const ui = IBM_Plex_Sans({ subsets: ["latin"], variable: "--font-ui", weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "blog_tech — expériences Claude Code",
  description: "Tests, problèmes, solutions — parfois en 3D.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable} ${mono.variable} ${ui.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

`frontend/app/page.tsx` (racine → redirige vers la locale par défaut) :
```tsx
import { redirect } from "next/navigation";
import { DEFAULT_LOCALE } from "@/shared/config";

export default function RootPage() {
  redirect(`/${DEFAULT_LOCALE}`);
}
```

- [ ] **Step 4: Write the failing test (shared/config)**

`frontend/src/shared/config/config.test.ts` :
```ts
import { describe, it, expect } from "vitest";
import { SITE_NAME, LOCALES, DEFAULT_LOCALE, isLocale } from "@/shared/config";

describe("shared/config", () => {
  it("expose les locales et le défaut", () => {
    expect(LOCALES).toEqual(["fr", "en"]);
    expect(DEFAULT_LOCALE).toBe("fr");
    expect(SITE_NAME).toContain("blog_tech");
  });
  it("isLocale valide fr/en et rejette le reste", () => {
    expect(isLocale("fr")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("de")).toBe(false);
    expect(isLocale("")).toBe(false);
  });
});
```

- [ ] **Step 5: Run to verify failure**

```bash
cd "/Users/marcelyapo/Sites/Django_nexjs/blog_tech /frontend"
npm install
npx playwright install chromium
npm test -- src/shared/config
```
Expected: FAIL (module `@/shared/config` introuvable).

- [ ] **Step 6: Implémentation shared/config**

`frontend/src/shared/config/index.ts` :
```ts
export const SITE_NAME = "blog_tech — expériences Claude Code";
export const LOCALES = ["fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "fr";

export function isLocale(x: string): x is Locale {
  return (LOCALES as readonly string[]).includes(x);
}
```

- [ ] **Step 7: Run to verify pass + build**

```bash
npm test -- src/shared/config
npm run lint:fsd
npm run build
```
Expected: tests PASS ; Steiger OK ; `next build` réussit (page `/` redirige, pas d'erreur).

- [ ] **Step 8: Commit**

```bash
cd "/Users/marcelyapo/Sites/Django_nexjs/blog_tech "
git add frontend
git commit -m "chore: bootstrap Next.js 15 + FSD skeleton, design tokens, tooling (vitest/steiger/playwright)"
```

---

### Task 2: shared/api — client HTTP typé + schémas zod

**Files:**
- Create: `frontend/src/shared/api/index.ts`, `frontend/src/shared/api/config.ts`, `frontend/src/shared/api/client.ts`
- Test: `frontend/src/shared/api/client.test.ts`

**Interfaces:**
- Consumes: rien.
- Produces: `apiBase(): string` ; `apiGet<T>(path: string, schema: ZodType<T>): Promise<T>` (fetch serveur, `cache: "no-store"` en dev, lève `ApiError` sur statut non-2xx ou parse invalide) ; `paginated<T>(item: ZodType<T>)` helper zod → `{count, next, previous, results: T[]}`.

- [ ] **Step 1: Write the failing test**

`frontend/src/shared/api/client.test.ts` :
```ts
import { describe, it, expect, vi, afterEach } from "vitest";
import { z } from "zod";
import { apiGet, ApiError, paginated } from "@/shared/api";

const Item = z.object({ slug: z.string() });

afterEach(() => vi.restoreAllMocks());

describe("shared/api", () => {
  it("parse une réponse paginée valide", async () => {
    vi.stubGlobal("fetch", vi.fn(async () =>
      new Response(JSON.stringify({ count: 1, next: null, previous: null, results: [{ slug: "a" }] }),
        { status: 200 })));
    const data = await apiGet("/articles/", paginated(Item));
    expect(data.count).toBe(1);
    expect(data.results[0].slug).toBe("a");
  });

  it("lève ApiError sur 404", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 404 })));
    await expect(apiGet("/articles/x/", Item)).rejects.toBeInstanceOf(ApiError);
  });

  it("lève ApiError si le JSON ne matche pas le schéma", async () => {
    vi.stubGlobal("fetch", vi.fn(async () =>
      new Response(JSON.stringify({ wrong: true }), { status: 200 })));
    await expect(apiGet("/x/", Item)).rejects.toBeInstanceOf(ApiError);
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
npm test -- src/shared/api
```
Expected: FAIL (module introuvable).

- [ ] **Step 3: Implémentation**

`frontend/src/shared/api/config.ts` :
```ts
export function apiBase(): string {
  return process.env.API_URL ?? "http://127.0.0.1:8000/api/v1";
}
```

`frontend/src/shared/api/client.ts` :
```ts
import { z, type ZodType } from "zod";
import { apiBase } from "./config";

export class ApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiGet<T>(path: string, schema: ZodType<T>): Promise<T> {
  const url = `${apiBase()}${path}`;
  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store" });
  } catch (e) {
    throw new ApiError(`réseau: ${(e as Error).message}`);
  }
  if (!res.ok) throw new ApiError(`HTTP ${res.status} sur ${path}`, res.status);
  const json = await res.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) throw new ApiError(`schéma invalide sur ${path}: ${parsed.error.message}`);
  return parsed.data;
}

export function paginated<T>(item: ZodType<T>) {
  return z.object({
    count: z.number(),
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(item),
  });
}
```

`frontend/src/shared/api/index.ts` :
```ts
export { apiGet, ApiError, paginated } from "./client";
export { apiBase } from "./config";
```

- [ ] **Step 4: Run to verify pass**

```bash
npm test -- src/shared/api
```
Expected: `3 passed`.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/shared/api && git commit -m "feat: shared/api client HTTP typé (zod, ApiError, paginated)"
```

---

### Task 3: shared/i18n + middleware de redirection de locale

**Files:**
- Create: `frontend/src/shared/i18n/index.ts`, `frontend/src/shared/i18n/dictionaries.ts`
- Create: `frontend/middleware.ts`
- Test: `frontend/src/shared/i18n/i18n.test.ts`

**Interfaces:**
- Consumes: `Locale`, `LOCALES`, `DEFAULT_LOCALE` (Task 1).
- Produces: `t(locale: Locale)` → objet de traductions `{ nav: {articles, series, search}, reading, search: {placeholder, results, empty}, backHome, relatedTitle }` ; middleware qui redirige `/` et les chemins sans préfixe locale vers `/<DEFAULT_LOCALE>/…`.

- [ ] **Step 1: Write the failing test**

`frontend/src/shared/i18n/i18n.test.ts` :
```ts
import { describe, it, expect } from "vitest";
import { t } from "@/shared/i18n";

describe("shared/i18n", () => {
  it("retourne le dictionnaire français", () => {
    expect(t("fr").nav.articles).toBe("Articles");
    expect(t("fr").search.empty).toContain("Aucun");
  });
  it("retourne le dictionnaire anglais", () => {
    expect(t("en").nav.articles).toBe("Articles");
    expect(t("en").reading).toContain("min");
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
npm test -- src/shared/i18n
```
Expected: FAIL.

- [ ] **Step 3: Implémentation**

`frontend/src/shared/i18n/dictionaries.ts` :
```ts
import type { Locale } from "@/shared/config";

export interface Dict {
  nav: { articles: string; series: string; search: string };
  reading: string;
  search: { placeholder: string; results: string; empty: string };
  backHome: string;
  relatedTitle: string;
  scene3dSoon: string;
}

const fr: Dict = {
  nav: { articles: "Articles", series: "Séries", search: "Recherche" },
  reading: "min de lecture",
  search: { placeholder: "chercher un bug, une solution, un pattern…", results: "résultats", empty: "Aucun résultat." },
  backHome: "← tous les articles",
  relatedTitle: "À lire aussi",
  scene3dSoon: "Scène 3D à venir — cet article sera rendu en manuscrit 3D.",
};

const en: Dict = {
  nav: { articles: "Articles", series: "Series", search: "Search" },
  reading: "min read",
  search: { placeholder: "search a bug, a fix, a pattern…", results: "results", empty: "No results." },
  backHome: "← all articles",
  relatedTitle: "Read next",
  scene3dSoon: "3D scene coming — this article will render as 3D handwriting.",
};

export const DICTS: Record<Locale, Dict> = { fr, en };
```

`frontend/src/shared/i18n/index.ts` :
```ts
import type { Locale } from "@/shared/config";
import { DICTS, type Dict } from "./dictionaries";

export function t(locale: Locale): Dict {
  return DICTS[locale];
}
export type { Dict } from "./dictionaries";
```

`frontend/middleware.ts` :
```ts
import { NextRequest, NextResponse } from "next/server";
import { LOCALES, DEFAULT_LOCALE } from "@/shared/config";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasLocale = LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|llms.txt|rss.xml|favicon.ico).*)"],
};
```

- [ ] **Step 4: Run to verify pass**

```bash
npm test -- src/shared/i18n
```
Expected: `2 passed`.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/shared/i18n frontend/middleware.ts
git commit -m "feat: shared/i18n (dictionnaires fr/en) + middleware redirection locale"
```

---

### Task 4: entities/article + tag (types, schémas, queries, UI cards)

> **Décision (revue produit)** : la page série est **différée en Phase 2** (l'API n'a
> pas d'endpoint « articles d'une série » ; une page qui liste tous les articles de la
> locale sous un titre de série tromperait le lecteur — un mauvais feature est pire
> qu'un feature absent). L'entité `series` n'est donc pas créée en 1B. Le lien « Séries »
> de la nav pointe vers l'ancre `#series` du feed home (comportement doux, honnête).

**Files:**
- Create: `frontend/src/entities/tag/index.ts`, `frontend/src/entities/tag/ui/tag-badge.tsx`, `frontend/src/entities/tag/ui/tag-badge.module.css`
- Create: `frontend/src/entities/article/index.ts`, `frontend/src/entities/article/model/types.ts`, `frontend/src/entities/article/api/schema.ts`, `frontend/src/entities/article/api/queries.ts`, `frontend/src/entities/article/ui/article-card.tsx`, `frontend/src/entities/article/ui/article-card.module.css`
- Test: `frontend/src/entities/article/api/schema.test.ts`, `frontend/src/entities/article/ui/article-card.test.tsx`

**Interfaces:**
- Consumes: `apiGet`, `paginated` (Task 2), `Locale` (Task 1).
- Produces:
  - types `ArticleListItem = {slug, locale, kind: ArticleKind, title, excerpt, readingTime: number, publishedAt: string|null, tags: string[]}`, `ArticleDetail = ArticleListItem & {bodyMdx: string, scene: object|null, series: string|null}`, `ArticleKind = "standard"|"code_3d"|"til"`.
  - `fetchArticles(params: {locale: Locale; kind?: string; tag?: string}): Promise<ArticleListItem[]>`
  - `fetchArticle(slug: string, locale: Locale): Promise<ArticleDetail>`
  - `searchArticles(q: string, locale: Locale): Promise<ArticleListItem[]>`
  - composants `<ArticleCard article={...} locale={...} />`, `<TagBadge name={...} kind?={...} />`.
- Note mappers : l'API renvoie `reading_time`/`published_at`/`body_mdx` (snake_case) → mapper vers camelCase dans `queries.ts`.

- [ ] **Step 1: Write the failing tests**

`frontend/src/entities/article/api/schema.test.ts` :
```ts
import { describe, it, expect } from "vitest";
import { articleListItemSchema, articleDetailSchema } from "@/entities/article/api/schema";

describe("article schemas", () => {
  it("parse un item de liste", () => {
    const r = articleListItemSchema.parse({
      slug: "s", locale: "fr", kind: "code_3d", title: "T", excerpt: "E",
      reading_time: 3, published_at: "2026-07-03T00:00:00Z", tags: ["python"],
    });
    expect(r.reading_time).toBe(3);
  });
  it("parse un détail avec scene et body", () => {
    const r = articleDetailSchema.parse({
      slug: "s", locale: "fr", kind: "code_3d", title: "T", excerpt: "E",
      reading_time: 3, published_at: null, tags: [],
      body_mdx: "# H", scene: { version: 2 }, series: null,
    });
    expect(r.body_mdx).toBe("# H");
    expect(r.scene).toEqual({ version: 2 });
  });
});
```

`frontend/src/entities/article/ui/article-card.test.tsx` :
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArticleCard } from "@/entities/article";

const base = {
  slug: "singleton", locale: "fr" as const, kind: "code_3d" as const,
  title: "Le singleton", excerpt: "Il avait raison.", readingTime: 9,
  publishedAt: "2026-06-28T00:00:00Z", tags: ["python", "design-patterns"],
};

describe("ArticleCard", () => {
  it("affiche titre, excerpt, temps de lecture et lien locale", () => {
    render(<ArticleCard article={base} locale="fr" />);
    expect(screen.getByText("Le singleton")).toBeInTheDocument();
    expect(screen.getByText(/Il avait raison/)).toBeInTheDocument();
    expect(screen.getByText(/9 min/)).toBeInTheDocument();
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/fr/articles/singleton");
  });
  it("marque le badge code_3d", () => {
    render(<ArticleCard article={base} locale="fr" />);
    expect(screen.getByText("code_3d")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
npm test -- src/entities/article
```
Expected: FAIL.

- [ ] **Step 3: Implémentation — schémas + types + queries**

`frontend/src/entities/article/api/schema.ts` :
```ts
import { z } from "zod";

export const articleKindSchema = z.enum(["standard", "code_3d", "til"]);

export const articleListItemSchema = z.object({
  slug: z.string(),
  locale: z.string(),
  kind: articleKindSchema,
  title: z.string(),
  excerpt: z.string(),
  reading_time: z.number(),
  published_at: z.string().nullable(),
  tags: z.array(z.string()),
});

export const articleDetailSchema = articleListItemSchema.extend({
  body_mdx: z.string(),
  scene: z.record(z.unknown()).nullable(),
  series: z.string().nullable(),
});
```

`frontend/src/entities/article/model/types.ts` :
```ts
import type { Locale } from "@/shared/config";

export type ArticleKind = "standard" | "code_3d" | "til";

export interface ArticleListItem {
  slug: string;
  locale: Locale;
  kind: ArticleKind;
  title: string;
  excerpt: string;
  readingTime: number;
  publishedAt: string | null;
  tags: string[];
}

export interface ArticleDetail extends ArticleListItem {
  bodyMdx: string;
  scene: Record<string, unknown> | null;
  series: string | null;
}
```

`frontend/src/entities/article/api/queries.ts` :
```ts
import { apiGet, paginated } from "@/shared/api";
import type { Locale } from "@/shared/config";
import { articleListItemSchema, articleDetailSchema } from "./schema";
import type { ArticleDetail, ArticleListItem } from "../model/types";
import { z } from "zod";

type Raw = z.infer<typeof articleListItemSchema>;
type RawDetail = z.infer<typeof articleDetailSchema>;

function toItem(r: Raw): ArticleListItem {
  return {
    slug: r.slug, locale: r.locale as Locale, kind: r.kind, title: r.title,
    excerpt: r.excerpt, readingTime: r.reading_time,
    publishedAt: r.published_at, tags: r.tags,
  };
}

function toDetail(r: RawDetail): ArticleDetail {
  return { ...toItem(r), bodyMdx: r.body_mdx, scene: r.scene, series: r.series };
}

export async function fetchArticles(
  params: { locale: Locale; kind?: string; tag?: string },
): Promise<ArticleListItem[]> {
  const q = new URLSearchParams({ locale: params.locale });
  if (params.kind) q.set("kind", params.kind);
  if (params.tag) q.set("tag", params.tag);
  const data = await apiGet(`/articles/?${q}`, paginated(articleListItemSchema));
  return data.results.map(toItem);
}

export async function fetchArticle(slug: string, locale: Locale): Promise<ArticleDetail> {
  const data = await apiGet(`/articles/${slug}/?locale=${locale}`, articleDetailSchema);
  return toDetail(data);
}

export async function searchArticles(q: string, locale: Locale): Promise<ArticleListItem[]> {
  const params = new URLSearchParams({ q, locale });
  const data = await apiGet(`/search/?${params}`, paginated(articleListItemSchema));
  return data.results.map(toItem);
}
```

- [ ] **Step 4: Implémentation — UI TagBadge + ArticleCard**

`frontend/src/entities/tag/ui/tag-badge.module.css` :
```css
.tag {
  font-family: var(--font-mono); font-size: 11.5px; padding: 3px 9px;
  border: 1px solid var(--line); border-radius: 99px; color: var(--muted);
  display: inline-block;
}
.k3d { border-color: var(--accent); color: var(--accent); }
.til { border-color: var(--info); color: var(--info); }
```

`frontend/src/entities/tag/ui/tag-badge.tsx` :
```tsx
import styles from "./tag-badge.module.css";

export function TagBadge({ name, kind }: { name: string; kind?: "k3d" | "til" }) {
  const cls = kind ? `${styles.tag} ${styles[kind]}` : styles.tag;
  return <span className={cls}>{name}</span>;
}
```

`frontend/src/entities/tag/index.ts` :
```ts
export { TagBadge } from "./ui/tag-badge";
```

`frontend/src/entities/article/ui/article-card.module.css` :
```css
.card { display: block; padding: 26px 0; border-top: 1px solid var(--line); transition: .18s; }
.card:hover .title { color: var(--accent); }
.row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.title {
  font-family: var(--font-display); font-weight: 700; font-size: 24px;
  color: var(--ink-strong); margin: 8px 0; transition: .18s;
}
.excerpt { color: var(--muted); font-size: 15px; max-width: 60ch; }
.meta { font-family: var(--font-mono); font-size: 12.5px; color: var(--muted); margin-top: 12px; }
```

`frontend/src/entities/article/ui/article-card.tsx` :
```tsx
import Link from "next/link";
import type { Locale } from "@/shared/config";
import { TagBadge } from "@/entities/tag";
import type { ArticleListItem } from "../model/types";
import styles from "./article-card.module.css";

export function ArticleCard({ article, locale }: { article: ArticleListItem; locale: Locale }) {
  const date = article.publishedAt ? article.publishedAt.slice(0, 10) : "";
  return (
    <Link className={styles.card} href={`/${locale}/articles/${article.slug}`}>
      <div className={styles.row}>
        {article.kind === "code_3d" && <TagBadge name="code_3d" kind="k3d" />}
        {article.kind === "til" && <TagBadge name="til" kind="til" />}
        {article.tags.map((tag) => <TagBadge key={tag} name={tag} />)}
      </div>
      <h3 className={styles.title}>{article.title}</h3>
      <p className={styles.excerpt}>{article.excerpt}</p>
      <div className={styles.meta}>{date} · {article.readingTime} min de lecture</div>
    </Link>
  );
}
```

`frontend/src/entities/article/index.ts` :
```ts
export { ArticleCard } from "./ui/article-card";
export { fetchArticles, fetchArticle, searchArticles } from "./api/queries";
export type { ArticleListItem, ArticleDetail, ArticleKind } from "./model/types";
```

- [ ] **Step 5: Run to verify pass**

```bash
npm test -- src/entities
npm run lint:fsd
```
Expected: tests PASS ; Steiger OK.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/entities
git commit -m "feat: entities article/tag (schémas zod, queries snake→camel, ArticleCard, TagBadge)"
```

---

### Task 5: widgets/site-shell (header, footer, nav, switch de langue, thème)

**Files:**
- Create: `frontend/src/features/toggle-theme/index.ts`, `frontend/src/features/toggle-theme/ui/theme-toggle.tsx`
- Create: `frontend/src/widgets/site-shell/index.ts`, `frontend/src/widgets/site-shell/ui/site-shell.tsx`, `frontend/src/widgets/site-shell/ui/site-shell.module.css`
- Test: `frontend/src/widgets/site-shell/ui/site-shell.test.tsx`

**Interfaces:**
- Consumes: `Locale`, `SITE_NAME`, `LOCALES` (Task 1), `t` (Task 3).
- Produces: `<SiteShell locale={...} active?={"articles"|"series"|"search"}>{children}</SiteShell>` (nav + footer + ThemeToggle) ; `<ThemeToggle />` (client, bascule `data-theme` sur `<html>`, persiste dans localStorage).

- [ ] **Step 1: Write the failing test**

`frontend/src/widgets/site-shell/ui/site-shell.test.tsx` :
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteShell } from "@/widgets/site-shell";

describe("SiteShell", () => {
  it("rend le logo, la nav et les enfants", () => {
    render(<SiteShell locale="fr"><p>contenu</p></SiteShell>);
    expect(screen.getByText(/blog/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Articles" })).toHaveAttribute("href", "/fr");
    expect(screen.getByRole("link", { name: "Recherche" })).toHaveAttribute("href", "/fr/search");
    expect(screen.getByText("contenu")).toBeInTheDocument();
  });
  it("propose le lien vers l'autre locale", () => {
    render(<SiteShell locale="fr"><span /></SiteShell>);
    expect(screen.getByRole("link", { name: /EN/i })).toHaveAttribute("href", "/en");
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
npm test -- src/widgets/site-shell
```
Expected: FAIL.

- [ ] **Step 3: Implémentation — ThemeToggle (feature)**

`frontend/src/features/toggle-theme/ui/theme-toggle.tsx` :
```tsx
"use client";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [light, setLight] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("bt-theme") === "light";
    setLight(saved);
    document.documentElement.dataset.theme = saved ? "light" : "";
  }, []);
  function toggle() {
    const next = !light;
    setLight(next);
    document.documentElement.dataset.theme = next ? "light" : "";
    localStorage.setItem("bt-theme", next ? "light" : "");
  }
  return (
    <button onClick={toggle} title="clair / sombre" aria-label="basculer le thème"
      style={{ cursor: "pointer", border: "1px solid var(--line)", borderRadius: 99,
        width: 34, height: 34, background: "none", color: "var(--ink)" }}>
      ◐
    </button>
  );
}
```

`frontend/src/features/toggle-theme/index.ts` :
```ts
export { ThemeToggle } from "./ui/theme-toggle";
```

- [ ] **Step 4: Implémentation — SiteShell (widget)**

`frontend/src/widgets/site-shell/ui/site-shell.module.css` :
```css
.nav { position: sticky; top: 0; z-index: 50;
  background: color-mix(in srgb, var(--bg) 86%, transparent);
  backdrop-filter: blur(10px); border-bottom: 1px solid var(--line); }
.inner { max-width: var(--max); margin: 0 auto; padding: 0 24px;
  display: flex; align-items: center; gap: 28px; height: 60px; }
.logo { font-family: var(--font-mono); font-weight: 600; font-size: 15px; }
.logo .p { color: var(--accent); }
.links { display: flex; gap: 22px; font-size: 14px; color: var(--muted); }
.links a:hover, .on { color: var(--ink-strong) !important; }
.right { margin-left: auto; display: flex; gap: 14px; align-items: center; }
.lang { font-family: var(--font-mono); font-size: 12px; color: var(--muted); }
.lang b { color: var(--ink-strong); }
footer { border-top: 1px solid var(--line); padding: 34px 0 44px;
  color: var(--muted); font-family: var(--font-mono); font-size: 12.5px; }
.foot { max-width: var(--max); margin: 0 auto; padding: 0 24px; display: flex; gap: 24px; flex-wrap: wrap; }
```

`frontend/src/widgets/site-shell/ui/site-shell.tsx` :
```tsx
import Link from "next/link";
import type { Locale } from "@/shared/config";
import { t } from "@/shared/i18n";
import { ThemeToggle } from "@/features/toggle-theme";
import styles from "./site-shell.module.css";

type Active = "articles" | "series" | "search";

export function SiteShell(
  { locale, active, children }: { locale: Locale; active?: Active; children: React.ReactNode },
) {
  const tr = t(locale);
  const other: Locale = locale === "fr" ? "en" : "fr";
  const cls = (a: Active) => (active === a ? `${styles.on}` : "");
  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.inner}>
          <Link className={styles.logo} href={`/${locale}`}>~/blog<span className={styles.p}>_tech</span></Link>
          <div className={styles.links}>
            <Link className={cls("articles")} href={`/${locale}`}>{tr.nav.articles}</Link>
            <Link className={cls("series")} href={`/${locale}#series`}>{tr.nav.series}</Link>
            <Link className={cls("search")} href={`/${locale}/search`}>{tr.nav.search}</Link>
          </div>
          <div className={styles.right}>
            <span className={styles.lang}><b>{locale.toUpperCase()}</b> / <Link href={`/${other}`}>{other.toUpperCase()}</Link></span>
            <ThemeToggle />
          </div>
        </div>
      </nav>
      <main>{children}</main>
      <footer>
        <div className={styles.foot}>
          <span>© 2026 Marcel Yapo</span>
          <a href="/rss.xml">RSS</a>
          <a href="/llms.txt">llms.txt</a>
          <span style={{ marginLeft: "auto" }}>fait avec Django + Next.js + Claude Code</span>
        </div>
      </footer>
    </>
  );
}
```

`frontend/src/widgets/site-shell/index.ts` :
```ts
export { SiteShell } from "./ui/site-shell";
```

- [ ] **Step 5: Run to verify pass**

```bash
npm test -- src/widgets/site-shell
npm run lint:fsd
```
Expected: tests PASS ; Steiger OK.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/features/toggle-theme frontend/src/widgets/site-shell
git commit -m "feat: widget site-shell (nav, footer, switch langue) + feature toggle-theme"
```

---

### Task 6: widgets/article-reader (markdown + sommaire + barre de progression)

**Files:**
- Create: `frontend/src/widgets/article-reader/index.ts`, `frontend/src/widgets/article-reader/ui/article-reader.tsx`, `frontend/src/widgets/article-reader/ui/reading-progress.tsx`, `frontend/src/widgets/article-reader/ui/article-reader.module.css`
- Test: `frontend/src/widgets/article-reader/ui/article-reader.test.tsx`

**Interfaces:**
- Consumes: `ArticleDetail` (Task 4), `t` (Task 3).
- Produces: `<ArticleReader article={ArticleDetail} locale={Locale} />` — rend le titre, la méta, le `bodyMdx` en markdown (react-markdown + remark-gfm + rehype-highlight), un encart `scene3dSoon` si `kind==="code_3d"`, et `<ReadingProgress />` (client, barre de progression au scroll).

- [ ] **Step 1: Write the failing test**

`frontend/src/widgets/article-reader/ui/article-reader.test.tsx` :
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArticleReader } from "@/widgets/article-reader";

const article = {
  slug: "singleton", locale: "fr" as const, kind: "code_3d" as const,
  title: "Le singleton", excerpt: "E", readingTime: 9,
  publishedAt: "2026-06-28T00:00:00Z", tags: ["python"],
  bodyMdx: "# La demande\n\nJe voulais un `Config` global.", scene: { version: 2 }, series: null,
};

describe("ArticleReader", () => {
  it("rend le titre et le markdown converti en HTML", () => {
    render(<ArticleReader article={article} locale="fr" />);
    expect(screen.getByRole("heading", { level: 1, name: "Le singleton" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "La demande" })).toBeInTheDocument();
    expect(screen.getByText("Config")).toBeInTheDocument(); // <code>
  });
  it("affiche l'encart scène 3D pour un article code_3d", () => {
    render(<ArticleReader article={article} locale="fr" />);
    expect(screen.getByText(/Scène 3D à venir/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
npm test -- src/widgets/article-reader
```
Expected: FAIL.

- [ ] **Step 3: Implémentation**

`frontend/src/widgets/article-reader/ui/reading-progress.tsx` :
```tsx
"use client";
import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setPct(max > 0 ? (h.scrollTop / max) * 100 : 0);
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => document.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div style={{ position: "fixed", top: 0, left: 0, height: 3, width: `${pct}%`,
      background: "var(--accent)", zIndex: 60, transition: "width .1s" }} />
  );
}
```

`frontend/src/widgets/article-reader/ui/article-reader.module.css` :
```css
.head { padding: 64px 0 34px; max-width: 760px; margin: 0 auto; }
.head h1 { font-family: var(--font-display); font-weight: 900;
  font-size: clamp(32px, 4.6vw, 52px); line-height: 1.08; color: var(--ink-strong); margin: 14px 0 18px; }
.meta { font-family: var(--font-mono); font-size: 12.5px; color: var(--muted); }
.prose { font-family: var(--font-body); font-size: 18.5px; line-height: 1.75;
  max-width: var(--measure); margin: 0 auto; }
.prose h2 { font-family: var(--font-display); font-weight: 700; font-size: 28px;
  color: var(--ink-strong); margin: 44px 0 14px; }
.prose p { margin: 0 0 20px; }
.prose code { font-family: var(--font-mono); font-size: .85em; background: var(--surface-2);
  padding: 2px 7px; border-radius: 5px; }
.prose pre { background: var(--bg-deep); border: 1px solid var(--line); border-radius: 12px;
  padding: 18px; overflow-x: auto; margin: 26px 0; }
.prose pre code { background: none; padding: 0; }
.scene3d { max-width: 760px; margin: 30px auto; border: 1px dashed var(--accent);
  border-radius: 14px; padding: 22px; background: var(--accent-soft);
  font-family: var(--font-mono); font-size: 13.5px; color: var(--accent); text-align: center; }
```

`frontend/src/widgets/article-reader/ui/article-reader.tsx` :
```tsx
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { Locale } from "@/shared/config";
import { t } from "@/shared/i18n";
import type { ArticleDetail } from "@/entities/article";
import { ReadingProgress } from "./reading-progress";
import styles from "./article-reader.module.css";

export function ArticleReader({ article, locale }: { article: ArticleDetail; locale: Locale }) {
  const tr = t(locale);
  const date = article.publishedAt ? article.publishedAt.slice(0, 10) : "";
  return (
    <article>
      <ReadingProgress />
      <header className={styles.head}>
        <h1>{article.title}</h1>
        <div className={styles.meta}>{date} · {article.readingTime} {tr.reading}</div>
      </header>
      {article.kind === "code_3d" && <div className={styles.scene3d}>✦ {tr.scene3dSoon}</div>}
      <div className={styles.prose}>
        <Markdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            // le titre de l'article est déjà le <h1> de la page : on descend les
            // titres du corps d'un niveau (le # du contenu seedé devient un h2).
            h1: (props) => <h2 {...props} />,
            h2: (props) => <h3 {...props} />,
          }}
        >
          {article.bodyMdx}
        </Markdown>
      </div>
    </article>
  );
}
```

`frontend/src/widgets/article-reader/index.ts` :
```ts
export { ArticleReader } from "./ui/article-reader";
```

- [ ] **Step 4: Run to verify pass**

```bash
npm test -- src/widgets/article-reader
npm run lint:fsd
```
Expected: tests PASS ; Steiger OK.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/widgets/article-reader
git commit -m "feat: widget article-reader (markdown, barre de progression, encart scène 3D)"
```

---

### Task 7: pages/home + route app + layout locale

**Files:**
- Create: `frontend/src/pages/home/index.ts`, `frontend/src/pages/home/ui/home-page.tsx`, `frontend/src/pages/home/ui/home-page.module.css`
- Create: `frontend/app/[locale]/layout.tsx`, `frontend/app/[locale]/page.tsx`
- Test: `frontend/src/pages/home/ui/home-page.test.tsx`

**Interfaces:**
- Consumes: `fetchArticles`, `ArticleCard`, `ArticleListItem` (Task 4), `SiteShell` (Task 5), `Locale`/`isLocale` (Task 1).
- Produces: `<HomePage locale={Locale} articles={ArticleListItem[]} />` ; route `/[locale]` (ISR 60s) qui appelle `fetchArticles` et rend `HomePage` dans `SiteShell`.

- [ ] **Step 1: Write the failing test**

`frontend/src/pages/home/ui/home-page.test.tsx` :
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HomePage } from "@/pages/home";

const articles = [
  { slug: "a", locale: "fr" as const, kind: "standard" as const, title: "Article A",
    excerpt: "E", readingTime: 5, publishedAt: "2026-06-21T00:00:00Z", tags: [] },
  { slug: "b", locale: "fr" as const, kind: "code_3d" as const, title: "Article B",
    excerpt: "E", readingTime: 9, publishedAt: "2026-06-28T00:00:00Z", tags: [] },
];

describe("HomePage", () => {
  it("liste les cartes d'articles", () => {
    render(<HomePage locale="fr" articles={articles} />);
    expect(screen.getByText("Article A")).toBeInTheDocument();
    expect(screen.getByText("Article B")).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
npm test -- src/pages/home
```
Expected: FAIL.

- [ ] **Step 3: Implémentation — HomePage**

`frontend/src/pages/home/ui/home-page.module.css` :
```css
.hero { padding: 72px 0 40px; }
.kicker { font-family: var(--font-mono); font-size: 12px; letter-spacing: .14em;
  text-transform: uppercase; color: var(--accent); }
.hero h1 { font-family: var(--font-display); font-weight: 900;
  font-size: clamp(40px, 6vw, 64px); line-height: 1.02; color: var(--ink-strong);
  max-width: 14ch; margin-top: 14px; }
.hero p { margin-top: 18px; max-width: 52ch; color: var(--muted); font-size: 17px; }
.feed { padding: 20px 0 90px; }
```

`frontend/src/pages/home/ui/home-page.tsx` :
```tsx
import type { Locale } from "@/shared/config";
import { ArticleCard, type ArticleListItem } from "@/entities/article";
import styles from "./home-page.module.css";

export function HomePage({ locale, articles }: { locale: Locale; articles: ArticleListItem[] }) {
  return (
    <div className="wrap">
      <header className={styles.hero}>
        <p className={styles.kicker}>// journal d'un dev &amp; son agent</p>
        <h1>Ce que je casse, ce que je répare, avec Claude Code.</h1>
        <p>Mes expériences réelles : les tests qui échouent, les bugs qui résistent,
          les solutions qui marchent.</p>
      </header>
      <section className={styles.feed} id="series">
        {articles.map((a) => <ArticleCard key={a.slug} article={a} locale={locale} />)}
      </section>
    </div>
  );
}
```

`frontend/src/pages/home/index.ts` :
```ts
export { HomePage } from "./ui/home-page";
```

- [ ] **Step 4: Implémentation — layout locale + route home**

`frontend/app/[locale]/layout.tsx` :
```tsx
import { notFound } from "next/navigation";
import { isLocale, LOCALES } from "@/shared/config";
import { SiteShell } from "@/widgets/site-shell";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout(
  { children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <SiteShell locale={locale}>{children}</SiteShell>;
}
```

`frontend/app/[locale]/page.tsx` :
```tsx
import { isLocale } from "@/shared/config";
import { notFound } from "next/navigation";
import { fetchArticles } from "@/entities/article";
import { HomePage } from "@/pages/home";

export const revalidate = 60;

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const articles = await fetchArticles({ locale });
  return <HomePage locale={locale} articles={articles} />;
}
```

- [ ] **Step 5: Run to verify pass + build**

```bash
npm test -- src/pages/home
npm run lint:fsd
# vérif build (Django doit tourner sur :8000 pour le fetch ISR au build)
API_URL=http://127.0.0.1:8000/api/v1 npm run build
```
Expected: tests PASS ; Steiger OK ; build réussit (route `/[locale]` générée).

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/home frontend/app/\[locale\]
git commit -m "feat: page home (feed d'articles) + layout locale + ISR"
```

---

### Task 8: pages/article + route + generateStaticParams

**Files:**
- Create: `frontend/src/pages/article/index.ts`, `frontend/src/pages/article/ui/article-page.tsx`, `frontend/src/pages/article/ui/article-page.module.css`
- Create: `frontend/app/[locale]/articles/[slug]/page.tsx`
- Test: `frontend/src/pages/article/ui/article-page.test.tsx`

**Interfaces:**
- Consumes: `ArticleReader` (Task 6), `fetchArticle`/`fetchArticles`/`ArticleDetail` (Task 4), `t` (Task 3), `Locale`/`isLocale` (Task 1).
- Produces: `<ArticlePage article={ArticleDetail} locale={Locale} />` (reader + lien retour) ; route `/[locale]/articles/[slug]` (ISR 60s, `generateStaticParams` sur les slugs publiés, `generateMetadata` OG, 404 via try/catch `ApiError`).

- [ ] **Step 1: Write the failing test**

`frontend/src/pages/article/ui/article-page.test.tsx` :
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArticlePage } from "@/pages/article";

const article = {
  slug: "singleton", locale: "fr" as const, kind: "standard" as const,
  title: "Le singleton", excerpt: "E", readingTime: 9,
  publishedAt: "2026-06-28T00:00:00Z", tags: ["python"],
  bodyMdx: "# Section\n\ntexte", scene: null, series: null,
};

describe("ArticlePage", () => {
  it("rend l'article et le lien retour vers la home locale", () => {
    render(<ArticlePage article={article} locale="fr" />);
    expect(screen.getByRole("heading", { level: 1, name: "Le singleton" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /tous les articles/ })).toHaveAttribute("href", "/fr");
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
npm test -- src/pages/article
```
Expected: FAIL.

- [ ] **Step 3: Implémentation — ArticlePage**

`frontend/src/pages/article/ui/article-page.module.css` :
```css
.back { display: block; max-width: 760px; margin: 30px auto 0; padding: 0 24px;
  font-family: var(--font-mono); font-size: 13px; color: var(--muted); }
.back:hover { color: var(--accent); }
.foot { max-width: 760px; margin: 40px auto; padding: 0 24px; }
```

`frontend/src/pages/article/ui/article-page.tsx` :
```tsx
import Link from "next/link";
import type { Locale } from "@/shared/config";
import { t } from "@/shared/i18n";
import { ArticleReader } from "@/widgets/article-reader";
import type { ArticleDetail } from "@/entities/article";
import styles from "./article-page.module.css";

export function ArticlePage({ article, locale }: { article: ArticleDetail; locale: Locale }) {
  const tr = t(locale);
  return (
    <div className="wrap">
      <ArticleReader article={article} locale={locale} />
      <div className={styles.foot}>
        <Link className={styles.back} href={`/${locale}`}>{tr.backHome}</Link>
      </div>
    </div>
  );
}
```

`frontend/src/pages/article/index.ts` :
```ts
export { ArticlePage } from "./ui/article-page";
```

- [ ] **Step 4: Implémentation — route article**

`frontend/app/[locale]/articles/[slug]/page.tsx` :
```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, LOCALES } from "@/shared/config";
import { ApiError } from "@/shared/api";
import { fetchArticle, fetchArticles } from "@/entities/article";
import { ArticlePage } from "@/pages/article";

export const revalidate = 60;

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of LOCALES) {
    try {
      const articles = await fetchArticles({ locale });
      for (const a of articles) params.push({ locale, slug: a.slug });
    } catch {
      // API indisponible au build : pas de pré-génération, ISR à la demande
    }
  }
  return params;
}

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string; slug: string }> },
): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  try {
    const a = await fetchArticle(slug, locale);
    return { title: a.title, description: a.excerpt,
      openGraph: { title: a.title, description: a.excerpt, type: "article" } };
  } catch {
    return {};
  }
}

export default async function Page(
  { params }: { params: Promise<{ locale: string; slug: string }> },
) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  try {
    const article = await fetchArticle(slug, locale);
    return <ArticlePage article={article} locale={locale} />;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}
```

- [ ] **Step 5: Run to verify pass + build**

```bash
npm test -- src/pages/article
npm run lint:fsd
API_URL=http://127.0.0.1:8000/api/v1 npm run build
```
Expected: tests PASS ; Steiger OK ; build génère les routes article des slugs publiés.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/article "frontend/app/[locale]/articles"
git commit -m "feat: page article (reader, metadata OG, ISR, 404) + generateStaticParams"
```

---

### Task 9: features/search-articles + pages/search + route

**Files:**
- Create: `frontend/src/features/search-articles/index.ts`, `frontend/src/features/search-articles/ui/search-box.tsx`, `frontend/src/features/search-articles/ui/search-box.module.css`
- Create: `frontend/src/pages/search/index.ts`, `frontend/src/pages/search/ui/search-page.tsx`, `frontend/src/pages/search/ui/search-page.module.css`
- Create: `frontend/app/[locale]/search/page.tsx`
- Test: `frontend/src/features/search-articles/ui/search-box.test.tsx`, `frontend/src/pages/search/ui/search-page.test.tsx`

**Interfaces:**
- Consumes: `ArticleCard`/`ArticleListItem` (Task 4), `t` (Task 3), `Locale`/`isLocale` (Task 1).
- Produces: `<SearchBox locale={Locale} initialQuery?={string} />` (client, formulaire GET qui navigue vers `/[locale]/search?q=`) ; `<SearchPage locale={Locale} query={string} results={ArticleListItem[]} />` ; route `/[locale]/search?q=` (fetch `searchArticles` si `q`).

- [ ] **Step 1: Write the failing tests**

`frontend/src/features/search-articles/ui/search-box.test.tsx` :
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SearchBox } from "@/features/search-articles";

describe("SearchBox", () => {
  it("rend un champ avec le placeholder et la valeur initiale", () => {
    render(<SearchBox locale="fr" initialQuery="docker" />);
    const input = screen.getByRole("searchbox");
    expect(input).toHaveValue("docker");
    expect(input).toHaveAttribute("placeholder");
  });
  it("cible l'action de recherche de la locale", () => {
    const { container } = render(<SearchBox locale="fr" />);
    expect(container.querySelector("form")).toHaveAttribute("action", "/fr/search");
  });
});
```

`frontend/src/pages/search/ui/search-page.test.tsx` :
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SearchPage } from "@/pages/search";

const results = [
  { slug: "a", locale: "fr" as const, kind: "standard" as const, title: "Docker menteur",
    excerpt: "E", readingTime: 7, publishedAt: "2026-06-21T00:00:00Z", tags: ["docker"] },
];

describe("SearchPage", () => {
  it("affiche les résultats", () => {
    render(<SearchPage locale="fr" query="docker" results={results} />);
    expect(screen.getByText("Docker menteur")).toBeInTheDocument();
  });
  it("affiche l'état vide quand aucun résultat pour une requête", () => {
    render(<SearchPage locale="fr" query="zzz" results={[]} />);
    expect(screen.getByText(/Aucun résultat/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
npm test -- src/features/search-articles src/pages/search
```
Expected: FAIL.

- [ ] **Step 3: Implémentation — SearchBox (feature)**

`frontend/src/features/search-articles/ui/search-box.module.css` :
```css
.box { display: flex; align-items: center; gap: 12px; background: var(--surface);
  border: 1px solid var(--line); border-radius: 12px; padding: 16px 20px;
  font-family: var(--font-mono); font-size: 16px; transition: .2s; }
.box:focus-within { border-color: var(--accent); box-shadow: 0 0 0 4px var(--accent-soft); }
.box input { flex: 1; background: none; border: none; outline: none;
  color: var(--ink-strong); font: inherit; }
.prompt { color: var(--accent); }
```

`frontend/src/features/search-articles/ui/search-box.tsx` :
```tsx
import type { Locale } from "@/shared/config";
import { t } from "@/shared/i18n";
import styles from "./search-box.module.css";

export function SearchBox({ locale, initialQuery = "" }: { locale: Locale; initialQuery?: string }) {
  const tr = t(locale);
  return (
    <form className={styles.box} action={`/${locale}/search`} method="get" role="search">
      <span className={styles.prompt}>›</span>
      <input type="search" name="q" defaultValue={initialQuery}
        placeholder={tr.search.placeholder} aria-label={tr.nav.search} />
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)" }}>⏎</span>
    </form>
  );
}
```

`frontend/src/features/search-articles/index.ts` :
```ts
export { SearchBox } from "./ui/search-box";
```

- [ ] **Step 4: Implémentation — SearchPage + route**

`frontend/src/pages/search/ui/search-page.module.css` :
```css
.hero { padding: 60px 0 20px; max-width: 760px; margin: 0 auto; }
.hero h1 { font-family: var(--font-display); font-weight: 900; font-size: 40px;
  color: var(--ink-strong); margin-bottom: 22px; }
.meta { font-family: var(--font-mono); font-size: 13px; color: var(--muted); margin: 18px 0 4px; }
.results { max-width: 760px; margin: 0 auto; padding-bottom: 90px; }
```

`frontend/src/pages/search/ui/search-page.tsx` :
```tsx
import type { Locale } from "@/shared/config";
import { t } from "@/shared/i18n";
import { ArticleCard, type ArticleListItem } from "@/entities/article";
import { SearchBox } from "@/features/search-articles";
import styles from "./search-page.module.css";

export function SearchPage(
  { locale, query, results }: { locale: Locale; query: string; results: ArticleListItem[] },
) {
  const tr = t(locale);
  return (
    <div className="wrap">
      <div className={styles.hero}>
        <h1>{tr.nav.search}</h1>
        <SearchBox locale={locale} initialQuery={query} />
        {query && <div className={styles.meta}>{results.length} {tr.search.results} · « {query} »</div>}
      </div>
      <div className={styles.results}>
        {query && results.length === 0 && <p className={styles.meta}>{tr.search.empty}</p>}
        {results.map((a) => <ArticleCard key={a.slug} article={a} locale={locale} />)}
      </div>
    </div>
  );
}
```

`frontend/src/pages/search/index.ts` :
```ts
export { SearchPage } from "./ui/search-page";
```

`frontend/app/[locale]/search/page.tsx` :
```tsx
import { notFound } from "next/navigation";
import { isLocale } from "@/shared/config";
import { searchArticles, type ArticleListItem } from "@/entities/article";
import { SearchPage } from "@/pages/search";

export default async function Page(
  { params, searchParams }: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ q?: string }>;
  },
) {
  const { locale } = await params;
  const { q } = await searchParams;
  if (!isLocale(locale)) notFound();
  const query = q ?? "";
  let results: ArticleListItem[] = [];
  if (query.trim()) results = await searchArticles(query, locale);
  return <SearchPage locale={locale} query={query} results={results} />;
}
```

- [ ] **Step 5: Run to verify pass**

```bash
npm test -- src/features/search-articles src/pages/search
npm run lint:fsd
```
Expected: tests PASS ; Steiger OK.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/features/search-articles frontend/src/pages/search "frontend/app/[locale]/search"
git commit -m "feat: recherche (SearchBox + page résultats sur /search?q=)"
```

---

### Task 10: routes proxy llms.txt + rss.xml

**Files:**
- Create: `frontend/app/llms.txt/route.ts`, `frontend/app/rss.xml/route.ts`
- Test: `frontend/src/shared/api/proxy.test.ts`

**Interfaces:**
- Consumes: `apiBase` (Task 2).
- Produces: `GET /llms.txt` → proxy texte de `${apiBase}/llms.txt` (`text/markdown`) ; `GET /rss.xml` → proxy de `${apiBase}/rss.xml` (`application/rss+xml`). Un helper `proxyText(path: string, contentType: string): Promise<Response>` testé unitairement.

- [ ] **Step 1: Write the failing test**

`frontend/src/shared/api/proxy.test.ts` :
```ts
import { describe, it, expect, vi, afterEach } from "vitest";
import { proxyText } from "@/shared/api/proxy";

afterEach(() => vi.restoreAllMocks());

describe("proxyText", () => {
  it("relaie le corps et pose le content-type", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("# hello", { status: 200 })));
    const res = await proxyText("/llms.txt", "text/markdown; charset=utf-8");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/markdown");
    expect(await res.text()).toBe("# hello");
  });
  it("renvoie 502 si l'upstream échoue", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 500 })));
    const res = await proxyText("/llms.txt", "text/markdown");
    expect(res.status).toBe(502);
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
npm test -- src/shared/api/proxy
```
Expected: FAIL.

- [ ] **Step 3: Implémentation**

`frontend/src/shared/api/proxy.ts` :
```ts
import { apiBase } from "./config";

export async function proxyText(path: string, contentType: string): Promise<Response> {
  const upstream = await fetch(`${apiBase()}${path}`, { cache: "no-store" });
  if (!upstream.ok) return new Response("upstream indisponible", { status: 502 });
  const body = await upstream.text();
  return new Response(body, { status: 200, headers: { "content-type": contentType } });
}
```

Ajouter à `frontend/src/shared/api/index.ts` :
```ts
export { proxyText } from "./proxy";
```

`frontend/app/llms.txt/route.ts` :
```ts
import { proxyText } from "@/shared/api";

export const dynamic = "force-dynamic";

export function GET() {
  return proxyText("/llms.txt", "text/markdown; charset=utf-8");
}
```

`frontend/app/rss.xml/route.ts` :
```ts
import { proxyText } from "@/shared/api";

export const dynamic = "force-dynamic";

export function GET() {
  return proxyText("/rss.xml", "application/rss+xml; charset=utf-8");
}
```

- [ ] **Step 4: Run to verify pass**

```bash
npm test -- src/shared/api/proxy
npm run lint:fsd
```
Expected: `2 passed` ; Steiger OK.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/shared/api frontend/app/llms.txt frontend/app/rss.xml
git commit -m "feat: routes proxy llms.txt et rss.xml vers l'API Django"
```

---

### Task 11: États UI (erreur, 404, vide), responsive, accessibilité

**Files:**
- Create: `frontend/app/[locale]/error.tsx`, `frontend/app/[locale]/not-found.tsx`, `frontend/app/[locale]/loading.tsx`
- Modify: `frontend/src/pages/home/ui/home-page.tsx` (état vide), `frontend/src/pages/home/ui/home-page.module.css` (bloc vide)
- Modify: `frontend/src/widgets/article-reader/ui/reading-progress.tsx` (transform au lieu de width)
- Modify: `frontend/src/features/toggle-theme/ui/theme-toggle.tsx` (cible 44px)
- Modify: `frontend/src/widgets/site-shell/ui/site-shell.module.css` (media query mobile)
- Test: `frontend/src/pages/home/ui/home-empty.test.tsx`

**Interfaces:**
- Consumes: `Locale`, `t` (Tasks 1, 3), `ArticleListItem` (Task 4).
- Produces: état vide de `HomePage` quand `articles.length === 0` ; boundaries Next `error`/`not-found`/`loading` de la zone `[locale]` ; barre de progression animée en `transform: scaleX` ; toggle thème à cible tactile ≥ 44px ; nav utilisable en mobile.

- [ ] **Step 1: Write the failing test (état vide home)**

`frontend/src/pages/home/ui/home-empty.test.tsx` :
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HomePage } from "@/pages/home";

describe("HomePage — état vide", () => {
  it("affiche un message quand il n'y a aucun article", () => {
    render(<HomePage locale="fr" articles={[]} />);
    expect(screen.getByText(/Aucun article pour l'instant/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
npm test -- src/pages/home/ui/home-empty
```
Expected: FAIL (pas de message d'état vide).

- [ ] **Step 3: État vide de HomePage**

Dans `frontend/src/pages/home/ui/home-page.tsx`, remplacer le `<section>` du feed par :
```tsx
      <section className={styles.feed} id="series">
        {articles.length === 0
          ? <p className={styles.empty}>Aucun article pour l'instant — reviens bientôt.</p>
          : articles.map((a) => <ArticleCard key={a.slug} article={a} locale={locale} />)}
      </section>
```

Ajouter à `frontend/src/pages/home/ui/home-page.module.css` :
```css
.empty { color: var(--muted); font-family: var(--font-mono); font-size: 14px;
  padding: 40px 0; border-top: 1px solid var(--line); }
```

- [ ] **Step 4: Boundaries Next (erreur, 404, chargement)**

`frontend/app/[locale]/error.tsx` :
```tsx
"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="wrap" style={{ padding: "80px 24px", textAlign: "center" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "var(--ink-strong)" }}>
        Quelque chose a cassé
      </h1>
      <p style={{ color: "var(--muted)", margin: "12px 0 24px" }}>
        Le contenu n'a pas pu être chargé. Le serveur est peut-être momentanément indisponible.
      </p>
      <button onClick={reset} style={{ minHeight: "var(--tap)", padding: "10px 18px",
        border: "1px solid var(--accent)", color: "var(--accent)", background: "var(--accent-soft)",
        borderRadius: 8, cursor: "pointer", fontFamily: "var(--font-mono)" }}>
        ↻ Réessayer
      </button>
    </div>
  );
}
```

`frontend/app/[locale]/not-found.tsx` :
```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap" style={{ padding: "80px 24px", textAlign: "center" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "var(--ink-strong)" }}>
        404 — page introuvable
      </h1>
      <p style={{ color: "var(--muted)", margin: "12px 0 24px" }}>
        Cet article n'existe pas ou n'est pas encore publié.
      </p>
      <Link href="/" style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}>
        ← retour à l'accueil
      </Link>
    </div>
  );
}
```

`frontend/app/[locale]/loading.tsx` :
```tsx
export default function Loading() {
  return (
    <div className="wrap" style={{ padding: "80px 24px", color: "var(--muted)",
      fontFamily: "var(--font-mono)", fontSize: 14 }}>
      Chargement…
    </div>
  );
}
```

- [ ] **Step 5: Barre de progression en transform + toggle 44px + nav mobile**

Remplacer le rendu de `frontend/src/widgets/article-reader/ui/reading-progress.tsx` par (la barre anime `transform`, pas `width` — contrainte motion-principles ; `prefers-reduced-motion` est déjà géré globalement) :
```tsx
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 60,
      transform: `scaleX(${pct / 100})`, transformOrigin: "0 50%",
      background: "var(--accent)" }} />
  );
```

Dans `frontend/src/features/toggle-theme/ui/theme-toggle.tsx`, porter la cible tactile à 44px :
```tsx
    <button onClick={toggle} title="clair / sombre" aria-label="basculer le thème"
      style={{ cursor: "pointer", border: "1px solid var(--line)", borderRadius: 99,
        width: "var(--tap)", height: "var(--tap)", background: "none", color: "var(--ink)",
        fontSize: 16, lineHeight: 1 }}>
      ◐
    </button>
```

Ajouter à la fin de `frontend/src/widgets/site-shell/ui/site-shell.module.css` (nav mobile — les liens rétrécissent, le switch de langue et le toggle restent accessibles) :
```css
@media (max-width: 640px) {
  .inner { gap: 14px; padding: 0 16px; }
  .links { gap: 14px; font-size: 13px; }
  .logo { font-size: 14px; }
}
```

- [ ] **Step 6: Run to verify pass + build**

```bash
npm test -- src/pages/home
npm run lint:fsd
API_URL=http://127.0.0.1:8000/api/v1 npm run build
```
Expected: tests PASS ; Steiger OK ; build OK (les boundaries ne cassent rien).

- [ ] **Step 7: Commit**

```bash
git add "frontend/app/[locale]/error.tsx" "frontend/app/[locale]/not-found.tsx" "frontend/app/[locale]/loading.tsx" frontend/src/pages/home frontend/src/widgets frontend/src/features/toggle-theme
git commit -m "feat: états UI (erreur/404/vide), responsive mobile, a11y (44px, transform, focus)"
```

---

### Task 12: SEO — hreflang, sitemap.xml, robots, partage social

**Files:**
- Create: `frontend/app/sitemap.ts`, `frontend/app/robots.ts`
- Create: `frontend/src/features/share-article/index.ts`, `frontend/src/features/share-article/ui/share-bar.tsx`
- Modify: `frontend/app/[locale]/articles/[slug]/page.tsx` (`alternates` hreflang + canonical dans `generateMetadata`)
- Modify: `frontend/src/pages/article/ui/article-page.tsx` (insérer `<ShareBar />`)
- Test: `frontend/src/features/share-article/ui/share-bar.test.tsx`

**Interfaces:**
- Consumes: `LOCALES` (Task 1), `fetchArticles` (Task 4).
- Produces: `GET /sitemap.xml` (accueils + articles × locales), `GET /robots.txt`, balises `hreflang`/`canonical` sur les articles, `<ShareBar title={string} />` (client : X, LinkedIn, copier le lien — cibles 44px, `aria-label` chacune).
- Note : les URLs absolues lisent `process.env.SITE_URL` (défaut `http://localhost:3000`).

- [ ] **Step 1: Write the failing test (ShareBar)**

`frontend/src/features/share-article/ui/share-bar.test.tsx` :
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ShareBar } from "@/features/share-article";

describe("ShareBar", () => {
  it("rend trois actions de partage avec labels accessibles", () => {
    render(<ShareBar title="Le singleton" />);
    expect(screen.getByRole("button", { name: /partager sur X/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /LinkedIn/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /copier le lien/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
npm test -- src/features/share-article
```
Expected: FAIL.

- [ ] **Step 3: Feature share-article**

`frontend/src/features/share-article/ui/share-bar.tsx` :
```tsx
"use client";
import type { CSSProperties } from "react";

const btn: CSSProperties = {
  width: "var(--tap)", height: "var(--tap)", borderRadius: 99,
  border: "1px solid var(--line)", background: "none", color: "var(--muted)",
  cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 14,
};

export function ShareBar({ title }: { title: string }) {
  function share(net: "x" | "linkedin" | "copy") {
    const url = window.location.href;
    if (net === "copy") { void navigator.clipboard?.writeText(url); return; }
    const enc = encodeURIComponent(url);
    const href = net === "x"
      ? `https://twitter.com/intent/tweet?url=${enc}&text=${encodeURIComponent(title)}`
      : `https://www.linkedin.com/sharing/share-offsite/?url=${enc}`;
    window.open(href, "_blank", "noopener");
  }
  return (
    <div role="group" aria-label="partager" style={{ display: "flex", gap: 10, margin: "24px 0" }}>
      <button onClick={() => share("x")} aria-label="partager sur X" style={btn}>𝕏</button>
      <button onClick={() => share("linkedin")} aria-label="partager sur LinkedIn" style={btn}>in</button>
      <button onClick={() => share("copy")} aria-label="copier le lien" style={btn}>⧉</button>
    </div>
  );
}
```

`frontend/src/features/share-article/index.ts` :
```ts
export { ShareBar } from "./ui/share-bar";
```

Dans `frontend/src/pages/article/ui/article-page.tsx`, importer et insérer `<ShareBar />` après le reader :
```tsx
import { ShareBar } from "@/features/share-article";
// …dans le rendu, juste après <ArticleReader .../> :
      <div className={styles.foot}>
        <ShareBar title={article.title} />
        <Link className={styles.back} href={`/${locale}`}>{tr.backHome}</Link>
      </div>
```
(remplacer le `<div className={styles.foot}>…</div>` existant par celui-ci.)

- [ ] **Step 4: hreflang + canonical sur les articles**

Dans `frontend/app/[locale]/articles/[slug]/page.tsx`, enrichir le `return` de `generateMetadata` (branche succès) :
```tsx
    return {
      title: a.title,
      description: a.excerpt,
      alternates: {
        canonical: `/${locale}/articles/${slug}`,
        languages: { fr: `/fr/articles/${slug}`, en: `/en/articles/${slug}` },
      },
      openGraph: { title: a.title, description: a.excerpt, type: "article" },
    };
```

- [ ] **Step 5: sitemap + robots**

`frontend/app/sitemap.ts` :
```ts
import type { MetadataRoute } from "next";
import { LOCALES } from "@/shared/config";
import { fetchArticles } from "@/entities/article";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL ?? "http://localhost:3000";
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of LOCALES) {
    entries.push({ url: `${base}/${locale}`, changeFrequency: "daily", priority: 1 });
    try {
      const articles = await fetchArticles({ locale });
      for (const a of articles) {
        entries.push({
          url: `${base}/${locale}/articles/${a.slug}`,
          lastModified: a.publishedAt ?? undefined,
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    } catch {
      // API indisponible au build : sitemap réduit aux accueils
    }
  }
  return entries;
}
```

`frontend/app/robots.ts` :
```ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.SITE_URL ?? "http://localhost:3000";
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${base}/sitemap.xml` };
}
```

- [ ] **Step 6: Run to verify pass + build**

```bash
npm test -- src/features/share-article
npm run lint:fsd
API_URL=http://127.0.0.1:8000/api/v1 npm run build
# vérif manuelle des routes SEO (Django + next dev requis) :
# curl -s localhost:3000/sitemap.xml | head -5 ; curl -s localhost:3000/robots.txt
```
Expected: test PASS ; Steiger OK ; build génère `/sitemap.xml` et `/robots.txt`.

- [ ] **Step 7: Commit**

```bash
git add frontend/app/sitemap.ts frontend/app/robots.ts frontend/src/features/share-article frontend/src/pages/article "frontend/app/[locale]/articles"
git commit -m "feat: SEO (hreflang, canonical, sitemap.xml, robots) + partage social"
```

---

### Task 13: smoke Playwright + vérification bout-en-bout

**Files:**
- Create: `frontend/playwright.config.ts`, `frontend/e2e/smoke.spec.ts`
- Modify: `frontend/.gitignore` (déjà couvre playwright-report/test-results)
- Test: `frontend/e2e/smoke.spec.ts`

**Interfaces:**
- Consumes: toutes les pages.
- Produces: config Playwright qui démarre `next dev` (webServer) et teste, Django devant tourner sur `:8000` avec le seed. 6 smoke tests : redirection `/`→`/fr`, home liste des articles, clic → article, recherche, 404 sur slug inexistant, nav mobile 375px.

- [ ] **Step 1: Config Playwright**

`frontend/playwright.config.ts` :
```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 0,
  reporter: [["list"]],
  use: { baseURL: "http://127.0.0.1:3000", trace: "on-first-retry" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    env: { API_URL: "http://127.0.0.1:8000/api/v1" },
    timeout: 60000,
  },
});
```

- [ ] **Step 2: Write the smoke tests**

`frontend/e2e/smoke.spec.ts` :
```ts
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
```

- [ ] **Step 3: Lancer la vérification bout-en-bout**

```bash
cd "/Users/marcelyapo/Sites/Django_nexjs/blog_tech "
# 1) Django doit tourner avec le seed :
( cd backend && source .venv/bin/activate && python manage.py seed_demo && \
  python manage.py runserver 127.0.0.1:8000 > /tmp/bt-django.log 2>&1 & )
sleep 3
# 2) suite Vitest complète + Steiger + build
cd frontend && npm test && npm run lint:fsd
API_URL=http://127.0.0.1:8000/api/v1 npm run build
# 3) smoke Playwright (démarre next dev tout seul)
npm run e2e
```
Expected: Vitest tout vert ; Steiger OK ; build OK ; 5 smoke tests PASS.

- [ ] **Step 4: Commit final**

```bash
cd "/Users/marcelyapo/Sites/Django_nexjs/blog_tech "
git add frontend/playwright.config.ts frontend/e2e
git commit -m "test: smoke Playwright bout-en-bout (home, article, recherche, série, redirection locale)"
```

---

## Vérification finale de la Phase 1

Une fois les 13 tâches passées, la Phase 1 (spec §9) est complète :
- Backend (1A) : API, recherche, llms.txt, admin, i18n structurel. ✓
- Frontend (1B) : blog public lisible, recherche, RSS/llms proxifiés, mode clair/sombre, i18n `/fr` `/en`, états d'erreur/404/vide, responsive mobile, a11y (focus, 44px, contraste AA), SEO (hreflang, sitemap, robots, OG) et partage social. ✓
- **Objectif atteint : le premier article est visible côté lecteur** sur `http://127.0.0.1:3000/fr`.

> Amendements post-revue des packs (2026-07-06) : ajout des Tasks 11 (états UI,
> responsive, a11y) et 12 (SEO + partage) ; retrait de la page série (différée
> Phase 2, décision produit) ; tokens danger/espacement/durée + focus + reduced-motion.

## Hors périmètre (rappel) — phases suivantes

- Renderer 3D manuscrit des articles `code_3d` → **Phase 4** (en 1B : encart « scène 3D à venir »).
- Studio d'édition + pipeline `/blog-capture` → **Phase 2**.
- Claps, commentaires, compteur de vues + **instrumentation analytics** → **Phase 3**.
- **Page série** (avec endpoint `?series=` dédié) → **Phase 2** (retirée de 1B : une page listant tous les articles sous un titre de série tromperait le lecteur — décision produit).
- Newsletter / capture email → **Phase 3** (en 1B : RSS + llms.txt comme canaux de suivi).
- Images OG générées dynamiquement depuis la forme du pattern → **Phase 4** (en 1B : métadonnées OG texte simples).
- Système de tokens complet à 3 niveaux (primitifs → sémantiques → composants) → progressif (en 1B : tokens sémantiques de base posés).
