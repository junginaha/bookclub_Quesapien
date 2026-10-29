/**
 * 약관 동의 기록 — 분쟁이 생긴 사람에게만 꺼내 보이는 자리.
 *
 * 운영자 지시(2026-10-29): "환불이나 기타 조항을 전면에 내세우지는 마.
 * 나중에 분쟁이 생기는 사람에게만 명확하게 보여줄 부분으로 뒤로 기록해."
 *
 * 화면에는 한 줄 링크만 두고, **누가 언제 어느 버전에 동의했는지**는
 * 신청 행의 `note`에 남긴다(DB 변경 없음 — 021의 기존 컬럼).
 * `/admin/bookclub` 표와 CSV에 그대로 나오므로 분쟁 시 바로 제시할 수 있다.
 */

/** 약관 시행일. `/terms` 화면 표기와 기록이 어긋날 수 없도록 한 곳에서 읽는다. */
export const TERMS_VERSION = "2026-10-29";

/** 동의 시각을 KST로 — 서버가 어느 지역에서 돌든 기록은 한국 시간이다. */
function kstStamp(at: Date): string {
  const s = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(at);
  return s.replace(/\. /g, "-").replace(/\.$/, "").replace(/-(\d{2}):/, " $1:");
}

/**
 * 신청 행에 남길 한 줄. 사람이 읽을 수 있고, 표·CSV에서 잘리지 않을 길이로.
 * 금액이 있으면 결제·환불 확인까지 같은 줄에 적는다.
 */
export function consentRecord(opts: { fee: number; at?: Date }): string {
  const when = kstStamp(opts.at ?? new Date());
  const parts = [
    `동의 ${when} KST`,
    `약관 v${TERMS_VERSION}`,
    "개인정보 수집·이용 동의",
  ];
  if (opts.fee > 0) parts.push("취소·환불 기준 확인(/terms#refund)");
  return parts.join(" · ");
}
