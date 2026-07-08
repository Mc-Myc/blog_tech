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
