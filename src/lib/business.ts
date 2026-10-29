/**
 * 사업자 정보 — 전자상거래법 제10조(사이버몰 운영자 의무)가 **초기화면에**
 * 표시하라고 정한 항목들을 한 곳에 모은다.
 *
 * 법정 기재사항: 상호·대표자 성명 / 영업소 주소 / 전화번호·전자우편주소 /
 * 사업자등록번호 / 이용약관. 통신판매업 신고를 한 경우 신고번호도 함께.
 *
 * **아직 받지 못한 값은 빈 문자열로 둔다.** 화면은 값이 있는 항목만 그리므로
 * 빈 라벨이 떠다니지 않는다 — 운영자가 값을 주면 여기 한 줄만 채우면 된다.
 */
export const BUSINESS = {
  /** 상호 — 사업자등록증 표기 기준(확인 필요 시 운영자에게 묻는다) */
  name: "질문하는 사람들",
  /** 대표자 성명 */
  ceo: "김정인",
  /** 사업자등록번호 (운영자 제공, 체크섬 검증 통과) */
  registrationNo: "561-40-01548",
  /**
   * 통신판매업 신고번호 — **지금은 비워 두는 것이 맞다.**
   *
   * 운영자 확인(2026-10-30): 사업자등록증상 **간이과세자**다. 전자상거래법
   * 제12조 제1항 단서와 시행령에 따라 간이과세자는 **통신판매업 신고 의무가
   * 면제**되므로, 신고번호가 없는 것이 정상이다. 화면에도 이 줄은 뜨지 않는다.
   *
   * 다만 간이과세자 지위는 매출에 따라 바뀐다 — 직전 연도 공급대가가
   * **1억 400만원**을 넘으면 일반과세자로 전환되고, 그때부터 신고 의무가
   * 생긴다. 전환되면 신고 후 이 한 줄만 채우면 된다.
   */
  mailOrderNo: "",
  /** 영업소(소비자 불만 처리) 주소 — TODO(unicorn) */
  address: "",
  /** 전화번호 — TODO(unicorn) */
  tel: "",
  /** 전자우편주소 */
  email: "junginaha@qsapiens.com",
} as const;

/** 화면에 한 줄로 늘어놓을 항목 — 값이 빈 것은 빼고 돌려준다. */
export function businessLines(): { label: string; value: string }[] {
  return [
    { label: "상호", value: BUSINESS.name },
    { label: "대표", value: BUSINESS.ceo },
    { label: "사업자등록번호", value: BUSINESS.registrationNo },
    { label: "통신판매업 신고번호", value: BUSINESS.mailOrderNo },
    { label: "주소", value: BUSINESS.address },
    { label: "전화", value: BUSINESS.tel },
    { label: "이메일", value: BUSINESS.email },
  ].filter((r) => r.value.length > 0);
}
