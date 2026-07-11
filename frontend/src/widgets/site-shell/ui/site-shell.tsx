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
            <Link className={cls("articles")} href={`/${locale}`} aria-current={active === "articles" ? "page" : undefined}>{tr.nav.articles}</Link>
            <Link className={cls("series")} href={`/${locale}#series`} aria-current={active === "series" ? "page" : undefined}>{tr.nav.series}</Link>
            <Link className={cls("search")} href={`/${locale}/search`} aria-current={active === "search" ? "page" : undefined}>{tr.nav.search}</Link>
          </div>
          <div className={styles.right}>
            <span className={styles.lang}><b>{locale.toUpperCase()}</b> / <Link href={`/${other}`}>{other.toUpperCase()}</Link></span>
            <ThemeToggle />
          </div>
        </div>
      </nav>
      <main>{children}</main>
      <footer className={styles.footer}>
        <div className={styles.foot}>
          <span>© 2026 Marcel Yapo</span>
          <a href="/rss.xml">RSS</a>
          <a href="/llms.txt">llms.txt</a>
          <span style={{ marginLeft: "auto" }}>{tr.footerTagline}</span>
        </div>
      </footer>
    </>
  );
}
