import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { BOOKCLUB_SESSIONS } from "@/lib/bookclub/data";
import { formatMonthDay, formatTimeRange, formatWeekdayFull, getStatus, seatNotice, sortByStart } from "@/lib/bookclub/selectors";
import { breadcrumbSchema, bookclubSessionEventSchema, faqSchema } from "@/lib/schema";
import { buildMetadata } from "@/lib/metadata";
import { DoodleRule } from "@/components/common/Doodle";
import "@/components/home/v3/home-v3.css";
import "../guide/guide.css";

/**
 * 강남 북클럽 지역 페이지.
 *
 * 왜 만드나: 우리는 강남에서 매달 여는 **실제 회차**를 날짜·장소까지 갖고 있는데,
 * "강남 북클럽"이라는 말을 겨냥한 페이지가 하나도 없었다(안내글 7편은 전부 연령 겨냥).
 * 지어낸 문장이 아니라 **이미 가진 사실**(열리는 회차, 장소, 참여비)로 채운다.
 *
 * 지역 표기: 주소는 서초구 강남대로지만 건물 이름과 생활권은 강남역이다.
 * 제목·본문은 '강남'으로 가고, 주소와 FAQ에서 서초·교대를 함께 답한다(운영자 결정 2026-10-31).
 */

const AREA = /강남|서초/;
const inArea = (s: (typeof BOOKCLUB_SESSIONS)[number]) => AREA.test(s.venue.name + s.venue.address);

const TITLE = "강남 북클럽 — 매월 셋째 토요일 오전, 강남역";
const DESC =
  "강남역에서 매월 셋째 토요일 오전 10시에 여는 질문 중심 북클럽입니다. 책을 다 읽지 않아도, 혼자 오셔도 괜찮습니다. 참여비 2만원.";

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESC,
  path: "/gangnam-bookclub",
  type: "website",
  keywords: ["강남 북클럽", "강남 독서모임", "강남역 독서모임", "서초 독서모임", "교대역 북클럽", "주말 오전 독서모임", "강남 책모임"],
});

export default function GangnamBookclubPage() {
  const all = BOOKCLUB_SESSIONS.filter(inArea);
  const upcoming = all.filter((s) => getStatus(s) !== "past").sort(sortByStart);
  const past = all.filter((s) => getStatus(s) === "past").sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt));
  const venues = [...new Map(all.map((s) => [s.venue.name, s.venue])).values()].filter((v) => v.address);

  // 답은 전부 우리가 실제로 가진 값에서 나온다 — 지어낸 문장이 없다.
  const faq = [
    {
      question: "강남 독서모임을 찾고 있어요. 언제 모이나요?",
      answer: `질문하는 사람들은 강남역 인근에서 매월 셋째 토요일 오전 10시부터 12시까지 모입니다. 현재 ${upcoming.length}개 회차가 열려 있고, 각 회차마다 읽는 책이 다릅니다.`,
    },
    {
      question: "장소가 정확히 어디인가요?",
      answer: venues.map((v) => `${v.name}(${v.address})`).join(", ") + ". 주소는 서초구이지만 강남역에서 걸어갈 수 있는 거리입니다.",
    },
    { question: "참여비가 있나요?", answer: "회차당 2만원입니다. 예약 후 결제까지 사이트에서 끝납니다. 취소·환불 기준은 이용약관에 적어두었습니다." },
    { question: "책을 다 못 읽어도 되나요?", answer: "됩니다. 질문 하나만 가지고 오시면 됩니다. 발표하거나 독서량을 평가하지 않습니다." },
    { question: "혼자 가도 괜찮을까요?", answer: "대부분 혼자 오십니다. 책이라는 공통 주제가 있어서 처음 오셔도 대화에 바로 들어가실 수 있습니다." },
    { question: "서초·교대 쪽에서도 가깝나요?", answer: "모임 장소가 서초구 강남대로에 있어 서초·교대 생활권에서도 가깝습니다." },
  ];

  return (
    <div className="qv3">
      <Header />
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "홈", href: "/" }, { name: "강남 북클럽", href: "/gangnam-bookclub" }]),
          faqSchema(faq),
          ...upcoming.map((s) => bookclubSessionEventSchema(s)),
        ]}
      />
      <main className="qv3-guide">
        <span className="qv3-guide-eyebrow">GANGNAM</span>
        <h1>강남 북클럽</h1>
        <p className="qv3-guide-lead">
          강남역에서 매월 셋째 토요일 오전 10시에 모입니다. 책을 다 읽지 않아도, 혼자 오셔도 괜찮습니다.
        </p>
        <p className="qv3-guide-say">마음에 드는 질문 하나 골라 오세요.</p>

        <section aria-labelledby="g-open">
          <h2 id="g-open">지금 예약할 수 있는 회차</h2>
          <DoodleRule />
          {upcoming.length === 0 ? (
            <p>지금은 열려 있는 회차가 없어요. <Link href="/bookclub">전체 북클럽</Link>에서 다른 날짜를 볼 수 있습니다.</p>
          ) : (
            <ul className="qv3-guide-list qv3-guide-list--rows">
              {upcoming.map((s) => (
                <li key={s.slug}>
                  <Link href={`/bookclub/${s.slug}`}>
                    <strong>{formatMonthDay(s.startsAt)} {formatWeekdayFull(s.startsAt)} {formatTimeRange(s.startsAt, s.endsAt)}</strong>
                    <span>『{s.bookTitle}』 {s.author} · {s.venue.name} · {seatNotice(s)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="g-where">
          <h2 id="g-where">어디서 모이나요</h2>
          <DoodleRule />
          <ul className="qv3-guide-list qv3-guide-list--rows">
            {venues.map((v) => (
              <li key={v.name}><span><strong>{v.name}</strong><span>{v.address}</span></span></li>
            ))}
          </ul>
          <p>주소는 서초구 강남대로이지만 강남역에서 걸어갈 수 있는 거리이고, 서초·교대 생활권에서도 가깝습니다.</p>
        </section>

        <section aria-labelledby="g-how">
          <h2 id="g-how">어떻게 진행하나요</h2>
          <DoodleRule />
          <p>
            한 회차는 두 시간입니다. 각자 질문 하나를 가지고 와서, 그 질문으로 이야기합니다.
            발표하지 않고, 독서량을 평가하지 않습니다. 참여비는 회차당 2만원이고 예약 후 결제까지 사이트에서 끝납니다.
          </p>
          <p><Link href="/guide">처음 오시는 분께 →</Link></p>
        </section>

        {past.length > 0 && (
          <section aria-labelledby="g-past">
            <h2 id="g-past">그동안 강남에서 읽은 책</h2>
            <DoodleRule />
            <ul className="qv3-guide-list qv3-guide-list--rows">
              {past.map((s) => (
                <li key={s.slug}>
                  <Link href={`/bookclub/${s.slug}`}><strong>『{s.bookTitle}』</strong><span>{s.author}</span></Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="g-faq">
          <h2 id="g-faq">자주 묻는 것들</h2>
          <DoodleRule />
          <dl className="qv3-guide-faq">
            {faq.map((f) => (
              <div key={f.question}>
                <dt>{f.question}</dt>
                <dd>{f.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
      <Footer />
    </div>
  );
}
