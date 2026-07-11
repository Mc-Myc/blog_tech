import Link from "next/link";
import type { Locale } from "@/shared/config";
import { t } from "@/shared/i18n";
import { TagBadge } from "@/entities/tag/@x/article";
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
      <div className={styles.meta}>{date} · {article.readingTime} {t(locale).reading}</div>
    </Link>
  );
}
