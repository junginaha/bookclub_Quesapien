import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { buildMetadata } from "@/lib/metadata";
import { breadcrumbSchema, bookclubItemListSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { formatMonthDay, isPast, sortByRecent } from "@/lib/bookclub/selectors";
import { getSessionsWithReserved } from "@/lib/bookclub/server";
import CalendarBookingHub from "./CalendarBookingHub";
import styles from "./bookclub-v2.module.css";

export const metadata: Metadata = buildMetadata({
  title: "북클럽 예약 — 질문하는 사람들",
  description:
    "캘린더에서 날짜를 고르고, 책과 모임 정보를 확인한 뒤 바로 예약하세요.",
  path: "/bookclub",
  type: "website",
});

export const dynamic = "force-dynamic";

export default async function BookClubPage() {
  const sessions = await getSessionsWithReserved();
  const past = sessions.filter(isPast).sort(sortByRecent);

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
          <p className={styles.eyebrow}>QUESTIONING PEOPLE · BOOKING</p>
          <h1 className={styles.title}>날짜를 고르면,<br />대화가 시작됩니다.</h1>
          <p className={styles.lede}>
            캘린더에서 원하는 날짜를 선택하세요. 책, 시간, 장소, 참가비를 확인하고 바로 예약할 수 있습니다.
          </p>
        </section>

        <CalendarBookingHub sessions={sessions} />

        <section className={styles.guide}>
          <div><b>1</b><span>날짜 선택</span></div>
          <i />
          <div><b>2</b><span>모임 확인</span></div>
          <i />
          <div><b>3</b><span>예약</span></div>
        </section>

        {past.length > 0 && (
          <section className={styles.pastSection}>
            <div className={styles.sectionHead}>
              <h2>지난 대화</h2>
              <Link href="/archive">모든 기록 보기 →</Link>
            </div>
            <div className={styles.pastGrid}>
              {past.slice(0, 6).map((session) => (
                <Link href={`/bookclub/${session.slug}`} className={styles.pastCard} key={session.slug}>
                  <span>{formatMonthDay(session.startsAt)}</span>
                  <strong>{session.bookTitle}</strong>
                  <small>{session.author}</small>
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
