import type { NoticeView } from "@/lib/journey/hitchhiker";
import styles from "./journey.module.css";

/** 공개된 공지만 본문을 렌더한다(서버에서 이미 미공개 본문을 제거해 전달). */
export default function JourneyNotices({ notices }: { notices: NoticeView[] }) {
  return (
    <div className={styles.notices}>
      {notices.map((n) =>
        n.published ? (
          <details key={n.id} className={styles.notice} open={n.order === Math.max(...notices.filter((x) => x.published).map((x) => x.order))}>
            <summary>
              <span className={styles.noticeLabel}>{n.label} · {n.publishLabel}</span>
              <strong>{n.title}</strong>
            </summary>
            <div className={styles.noticeBody}>
              {n.body.map((para, i) => <p key={i}>{para}</p>)}
              {n.cta && (
                <a className={styles.noticeCta} href={`#join`} data-kind={n.cta.kind}>{n.cta.label}</a>
              )}
            </div>
          </details>
        ) : (
          <div key={n.id} className={`${styles.notice} ${styles.noticeLocked}`} aria-disabled="true">
            <span className={styles.noticeLabel}>{n.label}</span>
            <strong>{n.publishLabel} 공개 예정</strong>
          </div>
        )
      )}
    </div>
  );
}
