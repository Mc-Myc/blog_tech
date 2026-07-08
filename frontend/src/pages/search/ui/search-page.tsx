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
