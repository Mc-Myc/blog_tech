import type { Locale } from "@/shared/config";

export interface Dict {
  nav: { articles: string; series: string; search: string };
  reading: string;
  search: { placeholder: string; results: string; empty: string };
  backHome: string;
  relatedTitle: string;
  scene3dSoon: string;
  hero: { kicker: string; title: string; subtitle: string };
  homeEmpty: string;
  notFoundTitle: string;
  notFoundBody: string;
  notFoundLink: string;
  errorTitle: string;
  errorBody: string;
  errorRetry: string;
  loadingLabel: string;
  footerTagline: string;
}

const fr: Dict = {
  nav: { articles: "Articles", series: "Séries", search: "Recherche" },
  reading: "min de lecture",
  search: { placeholder: "chercher un bug, une solution, un pattern…", results: "résultats", empty: "Aucun résultat." },
  backHome: "← tous les articles",
  relatedTitle: "À lire aussi",
  scene3dSoon: "Scène 3D à venir — cet article sera rendu en manuscrit 3D.",
  hero: {
    kicker: "// journal d'un dev & son agent",
    title: "Ce que je casse, ce que je répare, avec Claude Code.",
    subtitle: "Mes expériences réelles : les tests qui échouent, les bugs qui résistent, les solutions qui marchent.",
  },
  homeEmpty: "Aucun article pour l'instant — reviens bientôt.",
  notFoundTitle: "404 — page introuvable",
  notFoundBody: "Cet article n'existe pas ou n'est pas encore publié.",
  notFoundLink: "← retour à l'accueil",
  errorTitle: "Quelque chose a cassé",
  errorBody: "Le contenu n'a pas pu être chargé. Le serveur est peut-être momentanément indisponible.",
  errorRetry: "↻ Réessayer",
  loadingLabel: "Chargement…",
  footerTagline: "fait avec Django + Next.js + Claude Code",
};

const en: Dict = {
  nav: { articles: "Articles", series: "Series", search: "Search" },
  reading: "min read",
  search: { placeholder: "search a bug, a fix, a pattern…", results: "results", empty: "No results." },
  backHome: "← all articles",
  relatedTitle: "Read next",
  scene3dSoon: "3D scene coming — this article will render as 3D handwriting.",
  hero: {
    kicker: "// a dev & their agent, logged",
    title: "What I break, what I fix, with Claude Code.",
    subtitle: "Real experiments: the tests that fail, the bugs that resist, the fixes that work.",
  },
  homeEmpty: "No articles yet — check back soon.",
  notFoundTitle: "404 — page not found",
  notFoundBody: "This article doesn't exist or isn't published yet.",
  notFoundLink: "← back to home",
  errorTitle: "Something broke",
  errorBody: "The content couldn't be loaded. The server might be temporarily unavailable.",
  errorRetry: "↻ Retry",
  loadingLabel: "Loading…",
  footerTagline: "built with Django + Next.js + Claude Code",
};

export const DICTS: Record<Locale, Dict> = { fr, en };
