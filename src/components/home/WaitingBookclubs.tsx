"use client";

import NotifyForm from "@/components/bookclub/NotifyForm";
import "@/components/bookclub/bookclub.css";
import { ENCORE_THRESHOLD } from "@/lib/bookclub/selectors";
import { WAITING_CLUBS, originalSession, waitlistKey } from "@/lib/bookclub/waiting";
import BookCoverImage from "./BookCoverImage";
import styles from "./home-tools.module.css";

// 당신을 기다리는 북클럽 — 반응이 좋았던 지난 북클럽 + 새로 기획한 북클럽을
// 대기 명단으로 열어두고, 5명이 모이면 일정을 잡아 출발한다.
export default function WaitingBookclubs({ counts }: { counts: Record<string, number> }) {
  return (
    <section className={styles.section} id="waiting" aria-labelledby="waiting-title">
      <div className={styles.sectionHead}>
        <div>
          <span className={styles.eyebrow}>ENCORE · {ENCORE_THRESHOLD}명이 모이면 출발</span>
          <h2 id="waiting-title">당신을 기다리는 북클럽</h2>
          <p className={styles.sectionLead}>
            함께 읽고 싶은 책에 이름을 올려 주세요. {ENCORE_THRESHOLD}명이 모이면 날짜와 장소를 정해 가장 먼저 연락드립니다.
          </p>
        </div>
      </div>

      <ul className={styles.waitGrid}>
        {WAITING_CLUBS.map((club) => {
          const key = waitlistKey(club);
          const count = counts[key] ?? 0;
          const percent = Math.min(100, Math.round((count / ENCORE_THRESHOLD) * 100));
          const session = originalSession(club);
          const ready = count >= ENCORE_THRESHOLD;
          return (
            <li key={club.id} className={styles.waitCard}>
              <div className={styles.waitTop}>
                <span className={styles.nowCover} aria-hidden="true">
                  <BookCoverImage
                    title={club.bookTitle}
                    author={club.author}
                    coverUrl={session?.coverUrl}
                    fallbackClassName={styles.coverFallback}
                  />
                </span>
                <div>
                  <span className={styles.waitBadge}>{club.kind === "encore" ? "앵콜" : "새 기획"}</span>
                  <h3>{club.bookTitle}</h3>
                  <p className={styles.waitAuthor}>{club.author}</p>
                </div>
              </div>

              <p className={styles.waitPitch}>{club.pitch}</p>

              <div className={styles.waitProgress}>
                <div
                  className={styles.waitBar}
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={ENCORE_THRESHOLD}
                  aria-valuenow={Math.min(count, ENCORE_THRESHOLD)}
                  aria-label={`${club.bookTitle} 대기 인원`}
                >
                  <span style={{ width: `${percent}%` }} />
                </div>
                <p className={styles.waitCount}>
                  {ready
                    ? <><strong>{count}명</strong>이 모였어요 · 일정을 준비하고 있어요</>
                    : count > 0
                      ? <><strong>{count}명</strong> 기다리는 중 · {ENCORE_THRESHOLD - count}명 더 모이면 출발</>
                      : <>첫 번째로 이름을 올려 주세요 · {ENCORE_THRESHOLD}명이 모이면 출발</>}
                </p>
              </div>

              <details className={styles.waitQuestions}>
                <summary>이 책으로 나눌 발제 5</summary>
                <ol>
                  {club.questions.map((question) => <li key={question}>{question}</li>)}
                </ol>
              </details>

              <details className={styles.waitJoin}>
                <summary>함께 기다리기</summary>
                <NotifyForm clubSlug={key} mode="encore" />
              </details>
            </li>
          );
        })}
      </ul>
      <p className={styles.waitNote}>대기 명단은 참여 확정이 아닙니다. 일정이 정해지면 연락드리고, 그때 참여 여부를 결정하시면 됩니다.</p>
    </section>
  );
}
