import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { buildMetadata } from "@/lib/metadata";
import { breadcrumbSchema, bookclubItemListSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  feeLabel,
  formatMonthDay,
  formatTimeRange,
  formatWeekdayFull,
  getStatus,
  isPast,
  sortByRecent,
  sortByStart,
} from "@/lib/bookclub/selectors";
import { seatsLeft } from "@/lib/bookclub/types";
import { getSessionsWithReserved } from "@/lib/bookclub/server";
import styles from "./bookclub-v2.module.css";

export const metadata: Metadata = buildMetadata({
  title: "북클럽 — 오프라인 북토크 일정",
  description:
    "질문하는 사람들의 오프라인 북토크 일정. 날짜와 책을 확인하고 원하는 모임에 바로 참여할 수 있습니다.",
  path: "/bookclub",
  type: "website",
});

export const dynamic = "force-dynamic";

function statusLabel(status: ReturnType<typeof getStatus>, left: number) {
  if (status === "past") return "지난 모임";
  if (status === "full") return "대기 신청";
  if (status === "closed") return "신청 마감";
  return left > 0 ? `${left}자리 남음` : "신청 가능";
}

export default async function BookClubPage() {
  const sessions = await getSessionsWithReserved();
  const upcoming = sessions.filter((session) => !isPast(session)).sort(sortByStart);
  const past = sessions.filter(isPast).sort(sortByRecent);
  const featured = upcoming[0] ?? null;

  const crumbLd = breadcrumbSchema([
    { name: "홈", href: "/" },
    { name: "북클럽", href: "/bookclub" },
  ]);
  const itemListLd = bookclubItemListSchema(sessions);

  return (
    <div className={styles.page}>
      <JsonLd data={[crumbLd, itemListLd]} />
      <Header />

      <main className={styles.shell}>
        <section className={styles.intro}>
          <div>
            <p className={styles.eyebrow}>QUESTIONING PEOPLE · BOOK CLUB</p>
            <h1 className={styles.title}>책보다 오래 남는 건, 그날의 대화입니다.</h1>
          </div>
          <p className={styles.lede}>
            한 권을 읽고, 좋은 질문 하나를 들고 만납니다. 일정과 자리 수를 확인한 뒤
            원하는 모임에 바로 참여하세요.
          </p>
        </section>

        <div className={styles.utility}>
          <strong>{upcoming.length > 0 ? `예정된 모임 ${upcoming.length}개` : "다음 모임을 준비하고 있습니다"}</strong>
          <nav aria-label="북클럽 바로가기">
            <a className={styles.chip} href="#upcoming">예정</a>
            <a className={styles.chip} href="#past">지난 모임</a>
            <Link className={styles.chip} href="/archive">기록</Link>
          </nav>
        </div>

        {featured && (() => {
          const status = getStatus(featured);
          const left = seatsLeft(featured);
          const date = new Intl.DateTimeFormat("ko-KR", {
            timeZone: "Asia/Seoul",
            day: "2-digit",
          }).format(new Date(featured.startsAt));
          const month = new Intl.DateTimeFormat("ko-KR", {
            timeZone: "Asia/Seoul",
            month: "long",
          }).format(new Date(featured.startsAt));

          return (
            <section className={styles.feature} aria-labelledby="featured-bookclub">
              <div className={styles.dateBlock}>
                <span className={styles.month}>{month}</span>
                <span className={styles.day}>{date}</span>
              </div>

              <div className={styles.featureMain}>
                <p className={styles.eyebrow}>NEXT CONVERSATION</p>
                <h2 id="featured-bookclub">{featured.title}</h2>
                <div className={styles.meta}>
                  <span>{formatMonthDay(featured.startsAt)} {formatWeekdayFull(featured.startsAt)}</span>
                  <span>{formatTimeRange(featured.startsAt, featured.endsAt)}</span>
                  <span>{featured.venue.name}</span>
                  <span>{feeLabel(featured.fee)}</span>
                </div>
                <p className={styles.summary}>{featured.summary}</p>
              </div>

              <aside className={styles.actionCard}>
                <div className={styles.status}>{statusLabel(status, left)}</div>
                <Link className={styles.cta} href={`/bookclub/${featured.slug}`}>
                  모임 자세히 보기
                </Link>
                <p className={styles.note}>
                  상세 페이지에서 발제 미리보기, 위치, 신청 상태를 한 번에 확인할 수 있습니다.
                </p>
              </aside>
            </section>
          );
        })()}

        <section className={styles.section} id="upcoming">
          <div className={styles.sectionHead}>
            <h2>다가오는 모임</h2>
            <span>날짜 · 장소 · 자리 수를 먼저 보여드립니다.</span>
          </div>

          <div className={styles.eventList}>
            {upcoming.length === 0 ? (
              <div className={styles.event}>곧 새 일정을 공개합니다.</div>
            ) : upcoming.map((session) => {
              const status = getStatus(session);
              const left = seatsLeft(session);
              return (
                <Link className={styles.event} href={`/bookclub/${session.slug}`} key={session.slug}>
                  <div className={styles.eventDate}>{formatMonthDay(session.startsAt)}</div>
                  <div>
                    <h3 className={styles.eventTitle}>{session.bookTitle}</h3>
                    <div className={styles.eventSub}>{session.author}</div>
                  </div>
                  <div className={styles.eventMeta}>
                    {formatWeekdayFull(session.startsAt)} · {formatTimeRange(session.startsAt, session.endsAt)}
                    <br />
                    {session.venue.name} · {feeLabel(session.fee)}
                  </div>
                  <div className={styles.eventState}>{statusLabel(status, left)}</div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="how-it-works">
          <div className={styles.sectionHead}>
            <h2 id="how-it-works">참여는 단순하게</h2>
            <span>정보를 읽는 데보다 대화를 준비하는 데 시간을 쓰세요.</span>
          </div>

          <div className={styles.philosophy}>
            <article>
              <strong>01</strong>
              <h3>모임을 고릅니다</h3>
              <p>책, 날짜, 장소, 잔여 좌석을 한 화면에서 비교합니다.</p>
            </article>
            <article>
              <strong>02</strong>
              <h3>질문을 미리 봅니다</h3>
              <p>상세 페이지에서 그날의 대화 방향과 발제 일부를 확인합니다.</p>
            </article>
            <article>
              <strong>03</strong>
              <h3>바로 신청합니다</h3>
              <p>회원가입을 강요하지 않고 필요한 정보만 받아 신청을 마칩니다.</p>
            </article>
          </div>
        </section>

        {past.length > 0 && (
          <section className={styles.section} id="past">
            <div className={styles.sectionHead}>
              <h2>지난 대화</h2>
              <span>행사는 끝나도 질문은 남습니다.</span>
            </div>

            <div className={styles.eventList}>
              {past.map((session) => (
                <Link className={`${styles.event} ${styles.past}`} href={`/bookclub/${session.slug}`} key={session.slug}>
                  <div className={styles.eventDate}>{formatMonthDay(session.startsAt)}</div>
                  <div>
                    <h3 className={styles.eventTitle}>{session.bookTitle}</h3>
                    <div className={styles.eventSub}>{session.author}</div>
                  </div>
                  <div className={styles.eventMeta}>{session.venue.name}</div>
                  <div className={styles.eventState}>기록 보기</div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
