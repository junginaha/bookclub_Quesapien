"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { BookClubSession } from "@/lib/bookclub/types";
import { cardBlurb, getStatus } from "@/lib/bookclub/selectors";
import { UPCOMING_BOOKS, UPCOMING_GENRES, type UpcomingBook } from "@/lib/bookclub/upcoming";
import { INTEREST_CTA_ACTION, INTEREST_CTA_HOOK, interestCount, interestFace } from "@/lib/bookclub/interest";
import { DoodleBookBloom, DoodleFace, DoodleRule } from "@/components/common/Doodle";
import InterestDialog from "./InterestDialog";
import BookCoverImage from "./BookCoverImage";
import RecommendBookForm from "./RecommendBookForm";
import styles from "./home-tools.module.css";
import "@/components/bookclub/bookclub.css";

/**
 * 우리 다시 만나요 — 지난 북클럽(앵콜) + 아직 일정이 없는 후보 도서.
 * 달이 정해진 2026~2027 북토크는 실제 모임이 되어 MiniBookSpread가 맡는다.
 * 지난 모임은 날짜를 노출하지 않는다(운영자 지시).
 */
type Item =
  | { kind: "past"; key: string; session: BookClubSession }
  | { kind: "next"; key: string; book: UpcomingBook };

const FILTERS = UPCOMING_GENRES;
type Filter = (typeof FILTERS)[number];

export default function ReunionReads({
  sessions,
  counts = {},
}: {
  sessions: BookClubSession[];
  counts?: Record<string, number>;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [filter, setFilter] = useState<Filter>("전체");
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [liveCounts, setLiveCounts] = useState<Record<string, number>>({});
  const [recOpen, setRecOpen] = useState(false);
  // 검색 결과에서 `/#next-xxx`로 들어오면 그 책 카드로 데려간다.
  // 카드는 하이드레이션 뒤에 그려지므로 브라우저 기본 앵커 이동은 빈 화면을 잡는다.
  const [spot, setSpot] = useState<string | null>(null);
  useEffect(() => {
    const key = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    if (!key) return;
    const el = document.getElementById(key);
    if (!el || !sectionRef.current?.contains(el)) return;
    setFilter("전체"); // 장르 필터가 걸려 있으면 그 카드가 숨어 있다
    setSpot(key);
    // 위쪽 표지들이 늦게 로드되면 높이가 바뀌어 카드를 지나친다(실측 591px).
    // 자리가 잡힐 때까지 몇 번 더 맞춘다 — 이미 보이면 건너뛴다.
    const timers = [0, 350, 900, 1600].map((d) =>
      setTimeout(() => {
        const node = document.getElementById(key);
        if (!node) return;
        const box = node.getBoundingClientRect();
        const centered = box.top > 40 && box.bottom < window.innerHeight - 40;
        if (!centered) node.scrollIntoView({ block: "center", behavior: d === 0 ? "auto" : "smooth" });
      }, d)
    );
    // 잠깐만 표시하고 지운다 — 계속 켜두면 그게 영구 상태처럼 보인다
    timers.push(setTimeout(() => setSpot(null), 3200));
    return () => timers.forEach(clearTimeout);
  }, []);

  // 지난 모임 — 같은 책은 가장 최근 회차 하나만
  const seen = new Set<string>();
  const past: Item[] = sessions
    .filter((s) => getStatus(s) === "past")
    .sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt))
    .filter((s) => {
      const k = s.bookTitle + "\u0000" + s.author;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .map((s) => ({ kind: "past", key: s.slug, session: s }));
  const next: Item[] = UPCOMING_BOOKS.map((b) => ({ kind: "next", key: b.slug, book: b }));

  const items =
    filter === "전체" ? [...past, ...next] : next.filter((i) => i.kind === "next" && i.book.genre === filter);

  return (
    <section ref={sectionRef} className={styles.section} id="encore" aria-labelledby="encore-title">
      {/* 공지·llms.txt에 나간 #upcoming 링크를 살리기 위한 앵커 */}
      <span id="upcoming" aria-hidden="true" />
      <div className={styles.sectionHead}>
        <div>
          <span className={styles.eyebrow}>ENCORE</span>
          <h2 id="encore-title">우리 다시 만나요</h2>
          <DoodleRule />
          <p className={`${styles.sectionLead} lp-hand`}>
            지난 북클럽을 놓치셨나요? 다시 이야기를 나누고 싶다면 알려주세요. 취향이 같은 5분이 모이면 앵콜 북클럽을 열고 연결해드려요.
          </p>
        </div>
      </div>

      <div className={styles.upcomingFilters} role="tablist" aria-label="분류">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            className={filter === f ? styles.upcomingFilterActive : styles.upcomingFilter}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <ul className={styles.bookGrid} style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((item) => {
          const isPast = item.kind === "past";
          const title = isPast ? item.session.bookTitle : item.book.bookTitle;
          const author = isPast ? item.session.author : item.book.author;
          const blurb = isPast ? cardBlurb(item.session) : item.book.pitch;
          // 칸의 두 번째 얼굴 — 지난 모임은 그날의 질문, 오픈 예정은 한 줄 소개
          const face = isPast ? item.session.leadQuestion : item.book.pitch;
          const cover = (
            <>
              <span className={styles.coverVisual}>
                <BookCoverImage title={title} author={author} coverUrl={isPast ? item.session.coverUrl : undefined} isbn={isPast ? item.session.isbn : item.book.isbn} />
                {face ? <span className={styles.coverFace}>{face}</span> : null}
              </span>
              <span className={styles.coverMeta}>
                {/* 작가 — 제목 한 줄. 같은 크기·같은 굵기로 이어 읽힌다. */}
                <span className={styles.coverLine}>
                  <span className={styles.coverArtist}>{isPast ? author : credit(item.book)}</span>
                  <span className={styles.coverSep}>{"\u00a0—"}</span>{" "}
                  <span className={styles.coverTitle}>{title}</span>
                </span>
                {!isPast && <small>{item.book.genre}</small>}
              </span>
            </>
          );
          return (
            <li key={item.key} id={item.key} className={`${styles.bookLink}${spot === item.key ? ` ${styles.spotlit}` : ""}`}>
              {isPast ? (
                <Link href={"/bookclub/" + item.session.slug} className={styles.encoreCoverLink} aria-label={`${title} 북클럽 보기`}>
                  {cover}
                  <span className={styles.tag} aria-hidden="true">기록</span>
                </Link>
              ) : (
                cover
              )}
              {blurb && <p className={styles.upcomingPitch}>{blurb}</p>}
              <div className={styles.cardFoot}>
                {(() => {
                  const n = liveCounts[item.key] ?? counts[item.key] ?? 0;
                  const cta = { hook: INTEREST_CTA_HOOK, action: INTEREST_CTA_ACTION };
                  const tally = interestCount(n);
                  return (
                    <>
                      {tally && <p className={`${styles.cardFootCopy} lp-hand lp-hand--sm`}>{tally}</p>}
                      <button
                        type="button"
                        className={`${styles.cardAction} lp-hand lp-hand--sm`}
                        onClick={() => setOpenKey(item.key)}
                        aria-label={`${title} ${cta.action}`}
                      >
                        <DoodleFace kind={interestFace(n)} />
                        <span className={styles.cardActionLabel}>
                          <span className={styles.ctaHook}>{cta.hook}</span>
                          <span className={styles.ctaAction}>{cta.action}</span>
                        </span>
                      </button>
                    </>
                  );
                })()}
              </div>
              <InterestDialog
                clubSlug={item.key}
                bookTitle={title}
                open={openKey === item.key}
                onClose={() => setOpenKey(null)}
                onDone={(c) => c != null && setLiveCounts((m) => ({ ...m, [item.key]: c }))}
              />
            </li>
          );
        })}
      </ul>

      <div className={`${styles.upcomingRecommend}${recOpen ? ` ${styles.recommendOpen}` : ""}`} id="recommend">
        <div>
          <h3>함께 읽고 싶은 책 추천하기</h3>
          <DoodleRule />
          <p className={`${styles.sectionLead} lp-hand`}>
            목록에 없는 책이 있나요? 읽고 싶은 책을 추천해 주세요. 같은 책을 고른 분이 5명 모이면 북토크를 열고 연락드려요.
          </p>
          <button
            type="button"
            className={styles.recommendCta}
            aria-expanded={recOpen}
            aria-controls="recommend-form"
            onClick={() => setRecOpen((v) => !v)}
          >
            <span className={styles.recommendCtaGlow} aria-hidden="true" />
            <span className={styles.recommendCtaLabel}>{recOpen ? "접어두기" : "읽고 싶은 책 추천하기"}</span>
            <span className={styles.recommendCtaArrow} aria-hidden="true">{recOpen ? "↑" : "→"}</span>
          </button>
        </div>
        {/* 격자 밖, 폼 옆 빈자리 — 레퍼런스가 손그림을 크게 두는 바로 그 자리 */}
        <DoodleBookBloom className={styles.recommendBloom} />
        <div id="recommend-form" className={styles.recommendPanel} hidden={!recOpen}>
          <RecommendBookForm />
        </div>
      </div>
    </section>
  );
}

function credit(b: UpcomingBook) {
  const parts = [b.author || "저자 확인 중"];
  if (b.translator) parts.push(`${b.translator} 옮김`);
  if (b.publisher) parts.push(b.publisher);
  return parts.join(" · ");
}
