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
