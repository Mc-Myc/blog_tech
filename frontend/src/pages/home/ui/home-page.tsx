import type { Locale } from "@/shared/config";
import { t } from "@/shared/i18n";
import { ArticleCard, type ArticleListItem } from "@/entities/article";
import styles from "./home-page.module.css";

export function HomePage({ locale, articles }: { locale: Locale; articles: ArticleListItem[] }) {
  const tr = t(locale);
  return (
    <div className="wrap">
      <header className={styles.hero}>
        <p className={styles.kicker}>{tr.hero.kicker}</p>
        <h1>{tr.hero.title}</h1>
        <p>{tr.hero.subtitle}</p>
      </header>
      <section className={styles.feed} id="series">
        {articles.length === 0
          ? <p className={styles.empty}>{tr.homeEmpty}</p>
          : articles.map((a) => <ArticleCard key={a.slug} article={a} locale={locale} />)}
      </section>
    </div>
  );
}
