import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/metadata";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { ADAMS_RULES, FAQ, JOURNEY, JOURNEY_END, JOURNEY_PATH, NOTICES, ROADMAP, TOWEL, WHY, isPublished, noticesForNow } from "@/lib/journey/hitchhiker";
import { BOOKCLUB_SESSIONS, TALKS_2026 } from "@/lib/bookclub/data";
import { formatMonthDay, getStatus } from "@/lib/bookclub/selectors";
import JourneyInterest from "./JourneyInterest";
import JourneyNotices from "./JourneyNotices";
import styles from "./journey.module.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.qsapiens.com";

// 공지는 공개일(KST) 기준으로 서버에서 걸러낸다 — 1시간마다 재생성하면 공개일 자정 이후 1시간 내 반영.
export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "은하수 히치하이커 북클럽",
  description:
    "더글러스 애덤스의 은하수를 여행하는 히치하이커를 위한 안내서를 함께 읽습니다. 2026년 12월부터 2027년 3월까지 이어지는 특별한 독서여행.",
  path: JOURNEY_PATH,
  type: "website",
  ogSub: "2026.12.12 → 2027.03 · 4개월 함께 읽기",
  keywords: ["은하수를 여행하는 히치하이커를 위한 안내서", "더글러스 애덤스", "SF 소설 북클럽", "서울 독서모임", "함께 책 읽기", "조용한 독서모임", "2026 2027 독서 프로젝트", "타월 데이", "일론 머스크 인생책", "강남 독서모임", "셋째 토요일 북토크"],
});

export default function HitchhikerJourneyPage() {
  const now = new Date();
  const notices = noticesForNow(now);
  const roadmapDetailed = isPublished(NOTICES[2], now); // 월별 테마는 공지 3 공개 이후 노출
  // 함께할 북클럽 — 확정된 셋째 토요일 북토크 중 독서여행이 끝나기 전 회차.
  // 데이터는 북토크 시리즈 하나만 쓴다(일정·예약은 각 상세 페이지가 맡는다). 지난 회차는 뺀다.
  const talks = BOOKCLUB_SESSIONS.filter(
    (s) => s.series === TALKS_2026 && getStatus(s) !== "past" && Date.parse(s.startsAt) < Date.parse(JOURNEY_END)
  ).sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));

  const bookSchema = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: JOURNEY.book.title,
    alternateName: JOURNEY.book.originalTitle,
    author: { "@type": "Person", name: JOURNEY.book.authorEn, alternateName: JOURNEY.book.author },
    datePublished: JOURNEY.book.firstPublished,
    genre: "Science fiction",
    inLanguage: "ko",
  };
  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: JOURNEY.title,
    url: `${SITE_URL}${JOURNEY_PATH}`,
    description: "2026년 12월부터 2027년 3월까지 더글러스 애덤스의 《은하수를 여행하는 히치하이커를 위한 안내서》를 함께 읽는 질문하는 사람들의 독서 프로젝트(추천·모집 중, 일정 세부 예정).",
    about: bookSchema,
    isPartOf: { "@type": "WebSite", name: "질문하는 사람들", url: SITE_URL },
  };

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "홈", href: "/" }, { name: "북클럽", href: "/bookclub" }, { name: JOURNEY.title, href: JOURNEY_PATH }]),
          pageSchema,
          faqSchema(FAQ),
        ]}
      />
      <Header />
      <main className={styles.page}>
        {/* 상단 — 메인 카피 */}
        <section className={styles.hero} aria-labelledby="journey-title">
          <div className={styles.orbit} aria-hidden="true">
            <svg viewBox="0 0 120 120" focusable="false">
              <circle cx="60" cy="60" r="44" fill="none" stroke="currentColor" strokeWidth="1" opacity=".35" />
              <circle cx="60" cy="60" r="10" fill="currentColor" opacity=".9" />
              <circle cx="96" cy="34" r="3" fill="currentColor" />
            </svg>
          </div>
          <p className={styles.eyebrow}>
            <span className={styles.badge}>{JOURNEY.status}</span>
            <span>READING JOURNEY 2026 → 2027</span>
          </p>
          <h1 id="journey-title" className={styles.headline}>{JOURNEY.headline}</h1>
          <p className={styles.sub}>{JOURNEY.sub}</p>
          <dl className={styles.facts}>
            <div><dt>함께 읽을 책</dt><dd>《{JOURNEY.book.title}》 · {JOURNEY.book.author}</dd></div>
            <div><dt>기간</dt><dd>{JOURNEY.periodLong} <small>(예정)</small></dd></div>
            <div><dt>방식</dt><dd>4개월 함께 읽기 · 조용히 읽는 시간 포함</dd></div>
          </dl>
          <a className={styles.heroCta} href="#join">독서여행 참여 의향 남기기</a>
        </section>

        {/* 모집 — 이 책을 권하는 사람들 */}
        <section className={styles.section} aria-labelledby="why-title">
          <h2 id="why-title" className={styles.h2}>이 책을 권하는 사람들</h2>
          <ul className={styles.why}>
            {WHY.map((w) => (
              <li key={w.who}>
                <span className={styles.whyWho}>{w.who}</span>
                <strong>{w.title}</strong>
                <p>{w.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="towel-title">
          <h2 id="towel-title" className={styles.h2}>{TOWEL.title}</h2>
          <div className={styles.towel}>
            {TOWEL.body.map((p) => <p key={p}>{p}</p>)}
            <p className={styles.towelFoot}>{TOWEL.footnote}</p>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="rules-title">
          <h2 id="rules-title" className={styles.h2}>{ADAMS_RULES.title}</h2>
          <p className={styles.lead}>{ADAMS_RULES.lead}</p>
          <ol className={styles.rules}>
            {ADAMS_RULES.rules.map((r) => <li key={r}>{r}</li>)}
          </ol>
          <p className={styles.lead}>{ADAMS_RULES.close}</p>
        </section>

        {/* 중단 — 4개월 로드맵 */}
        <section className={styles.section} aria-labelledby="roadmap-title">
          <h2 id="roadmap-title" className={styles.h2}>4개월 독서 로드맵 <small>예정</small></h2>
          <ol className={styles.roadmap}>
            {ROADMAP.map((step) => (
              <li key={step.month}>
                <span className={styles.month}>{step.month}</span>
                <div>
                  <strong>{step.range}</strong>
                  {roadmapDetailed && <p>{step.theme}</p>}
                  <small lang="en">{step.original}</small>
                </div>
              </li>
            ))}
          </ol>
          <p className={styles.note}>중간중간 조용히 함께 읽는 시간을 마련합니다. 세부 일시·장소는 확정되는 대로 이 페이지에 안내합니다.</p>
        </section>

        {/* 함께할 북클럽 — 확정된 셋째 토요일 북토크와 연동 */}
        {talks.length > 0 && (
          <section className={styles.section} id="talks" aria-labelledby="talks-title">
            <h2 id="talks-title" className={styles.h2}>함께할 북클럽</h2>
            <p className={styles.lead}>
              독서여행과 함께 매월 셋째 토요일 오전 10시, 강남에서 북토크가 열립니다. 달마다 다른 책을 읽어요. 일정이 확정된 모임이라 바로 예약할 수 있습니다.
            </p>
            <ul className={styles.talks}>
              {talks.map((t) => (
                <li key={t.slug}>
                  <Link href={`/bookclub/${t.slug}`} className={styles.talk}>
                    <span className={styles.talkDate}>{formatMonthDay(t.startsAt)} 토요일 10:00</span>
                    <strong>{t.bookTitle}</strong>
                    <span className={styles.talkMeta}>{t.author} · {t.venue.name}</span>
                    <span className={styles.talkGo}>{getStatus(t) === "full" ? "대기 신청" : "예약하기"} →</span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className={styles.note}>
              전체 일정은 <Link href="/#talks">2026~2027 북토크</Link>와 <Link href="/bookclub">북클럽 일정</Link>에서 볼 수 있어요.
            </p>
          </section>
        )}

        <section className={styles.section} aria-labelledby="philosophy-title">
          <h2 id="philosophy-title" className={styles.h2}>이렇게 읽어요</h2>
          <ul className={styles.philosophy}>
            {JOURNEY.philosophy.map((line) => <li key={line}>{line}</li>)}
          </ul>
          <p className={styles.note}>함께하면 좋은 분: {JOURNEY.audience.join(" · ")}</p>
        </section>

        {/* 하단 — 공지 */}
        <section className={styles.section} aria-labelledby="notices-title">
          <h2 id="notices-title" className={styles.h2}>공지</h2>
          <JourneyNotices notices={notices} />
        </section>

        {/* 참여 의향 */}
        <section className={styles.section} id="join" aria-labelledby="join-title">
          <h2 id="join-title" className={styles.h2}>함께 떠나기</h2>
          <JourneyInterest scheduleConfirmed={JOURNEY.scheduleConfirmed} quietOpen={isPublished(NOTICES[1], now)} />
        </section>

        {/* 책 정보 */}
        <section className={styles.section} aria-labelledby="book-title">
          <h2 id="book-title" className={styles.h2}>책 정보</h2>
          <dl className={styles.facts}>
            <div><dt>제목</dt><dd>《{JOURNEY.book.title}》 <span lang="en">({JOURNEY.book.originalTitle})</span></dd></div>
            <div><dt>저자</dt><dd>{JOURNEY.book.author} <span lang="en">({JOURNEY.book.authorEn})</span></dd></div>
            <div><dt>원작 첫 출간</dt><dd>{JOURNEY.book.firstPublished}년</dd></div>
            <div><dt>읽는 판본</dt><dd>{JOURNEY.book.note}</dd></div>
          </dl>
        </section>

        {/* FAQ */}
        <section className={styles.section} aria-labelledby="faq-title">
          <h2 id="faq-title" className={styles.h2}>자주 묻는 질문</h2>
          <div className={styles.faq}>
            {FAQ.map((f) => (
              <details key={f.question}>
                <summary>{f.question}</summary>
                <p>{f.answer}</p>
              </details>
            ))}
          </div>
          <p className={styles.note}>
            지금 열려 있는 다른 모임은 <Link href="/bookclub">북클럽 일정</Link>에서 확인할 수 있어요.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
