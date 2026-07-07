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
