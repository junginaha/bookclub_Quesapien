import { RECORD_CHANNELS } from "@/lib/site/channels";
import styles from "./home-tools.module.css";

// 아카이빙 — 모임 기록은 유튜브·블로그로 연결만 한다(최소 노출).
export default function RecordLinks() {
  if (RECORD_CHANNELS.length === 0) return null;
  return (
    <section className={`${styles.section} ${styles.records}`} id="records" aria-labelledby="records-title">
      <h2 id="records-title">지난 모임 기록</h2>
      {RECORD_CHANNELS.map((channel) => (
        <a key={channel.label} href={channel.href} target="_blank" rel="noopener noreferrer">{channel.label} →</a>
      ))}
    </section>
  );
}
