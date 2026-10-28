import type { BookClubSession, SessionStatus } from "@/lib/bookclub/types";
import { feeLabel, seatNotice } from "@/lib/bookclub/selectors";

/**
 * 상태별 pill 문구 — 타임라인 카드와 상세 페이지가 이 컴포넌트를 공유해 문구가
 * 어긋나지 않게 한다. 남은 자리 수는 노출하지 않는다(운영자 지시 2026-10-28).
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
      return <span className="qc-pill is-fee">{seatNotice(session)} · {feeLabel(session.fee)}</span>;
    case "full":
      return <span className="qc-pill is-full">마감</span>;
    case "closed":
      return <span className="qc-pill is-tentative">신청 마감</span>;
    case "past":
      return <span className="qc-pill is-past">지난 모임</span>;
  }
}
