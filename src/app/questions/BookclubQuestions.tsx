import Link from "next/link";
import { BOOKCLUB_SESSIONS } from "@/lib/bookclub/data";
import { dateKey, getStatus } from "@/lib/bookclub/selectors";
import type { BookClubSession } from "@/lib/bookclub/types";
import "./bookclub-questions.css";

/**
 * 우리가 북클럽에서 실제로 나눈 질문과 발제를 한곳에 모은다(2026-11-09 운영자 요청).
 *
 * 출처는 모임 데이터(`BOOKCLUB_SESSIONS`)의 대표 질문(leadQuestion)과 발제(agendaPreview)뿐이다.
 * 지어낸 질문은 넣지 않는다 — 질문 기록이 없는 모임은 목록에 나오지 않는다.
 * 물음표로 끝나지 않는 안내 문장("작가에게 직접 묻습니다" 등)은 질문이 아니므로 뺀다.
 */
function questionsOf(s: BookClubSession): string[] {
  const all = [s.leadQuestion, ...(s.agendaPreview ?? [])]
    .map((q) => (q ?? "").trim())
    .filter((q) => q.endsWith("?"));
  return Array.from(new Set(all));
}

function dateLabel(s: BookClubSession): string {
  const [y, m, d] = dateKey(s.startsAt).split("-").map(Number);
  return `${y}년 ${m}월 ${d}일`;
}

function Group({ title, lead, sessions }: { title: string; lead: string; sessions: BookClubSession[] }) {
  if (sessions.length === 0) return null;
  return (
    <div className="bq-group">
      <h3 className="bq-group-title">{title}</h3>
      <p className="bq-group-lead">{lead}</p>
      <div className="bq-grid">
        {sessions.map((s) => (
          <article key={s.slug} className="bq-book">
            <header className="bq-book-head">
              <span className="bq-date">{dateLabel(s)}</span>
              <Link href={`/bookclub/${s.slug}`} className="bq-title">
                『{s.bookTitle}』
              </Link>
              <span className="bq-author">{s.author}</span>
            </header>
            <ol className="bq-list">
              {questionsOf(s).map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ol>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function BookclubQuestions() {
  const withQuestions = BOOKCLUB_SESSIONS.filter((s) => questionsOf(s).length > 0);
  const byDate = (a: BookClubSession, b: BookClubSession) => Date.parse(a.startsAt) - Date.parse(b.startsAt);
  const upcoming = withQuestions.filter((s) => getStatus(s) !== "past").sort(byDate);
  // 지난 모임은 최근 것부터
  const past = withQuestions.filter((s) => getStatus(s) === "past").sort((a, b) => byDate(b, a));

  return (
    <section className="bq" aria-labelledby="bq-title" id="bookclub-questions">
      <div className="bq-wrap">
        <div className="bq-eyebrow">Our questions — 우리가 나눈 질문</div>
        <h2 id="bq-title" className="bq-h2">북클럽에서 함께 나눈 질문과 발제</h2>
        <p className="bq-lead">
          지난 모임에서 나눈 질문과 앞으로 열릴 북토크의 발제를 책별로 모았습니다. 책 제목을 누르면 모임 안내로 이동합니다.
        </p>
        <Group title="다가오는 북토크 발제" lead="미리 읽고 생각해 오시면 대화가 더 깊어집니다." sessions={upcoming} />
        <Group title="지난 북클럽에서 나눈 질문" lead="모임을 위해 준비한 질문과 발제입니다." sessions={past} />
      </div>
    </section>
  );
}
