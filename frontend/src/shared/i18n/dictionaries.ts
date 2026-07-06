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
