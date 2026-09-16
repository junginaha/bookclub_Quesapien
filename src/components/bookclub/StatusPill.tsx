import type { BookClubSession, SessionStatus } from "@/lib/bookclub/types";
import { feeLabel, seatsLeft } from "@/lib/bookclub/selectors";

/**
 * 상태별 pill 문구 — 타임라인 카드와 상세 페이지가 이 컴포넌트를 공유해 문구가
 * 어긋나지 않게 한다. open은 항상 자리 수를 보여준다(작업지시서 Phase 1-5).
 */
export default function StatusPill({
  status,
  session,
}: {
  status: SessionStatus;
  session: BookClubSession;
}) {
  switch (status) {
    case "open":
      return <span className="qc-pill is-fee">{seatsLeft(session)}자리 남음 · {feeLabel(session.fee)}</span>;
    case "full":
      return <span className="qc-pill is-full">마감</span>;
    case "closed":
      return <span className="qc-pill is-tentative">신청 마감</span>;
    case "past":
      return <span className="qc-pill is-past">지난 모임</span>;
  }
}
