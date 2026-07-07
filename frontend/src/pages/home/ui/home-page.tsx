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
