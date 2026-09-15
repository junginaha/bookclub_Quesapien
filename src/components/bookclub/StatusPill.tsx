import type { BookClub, ClubStatus } from "@/lib/bookclubs";
import { feeLabel, remainingSeats } from "@/lib/bookclubs";

/**
 * 상태별 pill/보조문구. A-2(c) 카드 상태별 자동 분기를 여기 한 곳에서만 계산한다
 * — 타임라인 카드와 상세 페이지가 이 컴포넌트를 공유해 문구가 어긋나지 않게 한다.
 */
export default function StatusPill({
  status,
  club,
  joinedCount,
}: {
  status: ClubStatus;
  club: BookClub;
  joinedCount: number;
}) {
  switch (status) {
    case "open":
      return <span className="qc-pill is-fee">{feeLabel(club.fee)}</span>;
    case "almost_full": {
      const left = remainingSeats(club, joinedCount);
      return <span className="qc-pill is-almost">{left}자리 남음</span>;
    }
    case "full":
      return <span className="qc-pill is-full">마감</span>;
    case "tentative":
      return <span className="qc-pill is-tentative">책 선정 중</span>;
    case "past":
      return <span className="qc-pill is-past">지난 모임</span>;
  }
}
