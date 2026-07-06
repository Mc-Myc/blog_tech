import styles from "./tag-badge.module.css";

export function TagBadge({ name, kind }: { name: string; kind?: "k3d" | "til" }) {
  const cls = kind ? `${styles.tag} ${styles[kind]}` : styles.tag;
  return <span className={cls}>{name}</span>;
}
