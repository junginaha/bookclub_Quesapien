// /llms.txt — AI 검색엔진(ChatGPT·Claude·Perplexity 등)이 사이트를 한 번에 파악하도록
// 요약한 평문 문서(llmstxt.org 형식). 모임 목록은 BOOKCLUB_SESSIONS(단일 소스)에서
// 매번 생성한다 — 여기에 일정·장소를 따로 적지 않는다.
import { BOOKCLUB_SESSIONS } from "@/lib/bookclub/data";
import {
  feeLabel,
  formatMonthDay,
  formatTimeRange,
  formatWeekdayFull,
  isPast,
  sortByRecent,
  sortByStart,
} from "@/lib/bookclub/selectors";
import type { BookClubSession } from "@/lib/bookclub/types";
import { activeGuides } from "@/content/ai-guides";
import { UPCOMING_BOOKS } from "@/lib/bookclub/upcoming";
import { GIANTS_ENABLED } from "@/lib/features";
import { businessLines } from "@/lib/business";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.qsapiens.com";

export const revalidate = 3600;

function sessionLines(s: BookClubSession): string {
  const year = new Date(s.startsAt).toLocaleString("en-US", { timeZone: "Asia/Seoul", year: "numeric" });
  const lines = [
    `- [${s.title}](${SITE_URL}/bookclub/${s.slug})`,
    `  - 책: 『${s.bookTitle}』 (${s.author})`,
    `  - 일시: ${year}년 ${formatMonthDay(s.startsAt)} ${formatWeekdayFull(s.startsAt)} ${formatTimeRange(s.startsAt, s.endsAt)}`,
    `  - 장소: ${s.venue.name}${s.venue.address ? ` (${s.venue.address})` : ""}`,
    `  - 참여비: ${s.feeLabelOverride ?? feeLabel(s.fee)}`,
  ];
  if (s.leadQuestion) lines.push(`  - 대표 발제: ${s.leadQuestion}`);
  return lines.join("\n");
}

export function GET() {
  const upcoming = BOOKCLUB_SESSIONS.filter((s) => !isPast(s)).sort(sortByStart);
  const past = BOOKCLUB_SESSIONS.filter(isPast).sort(sortByRecent);

  const body = `# 질문하는 사람들 (Qsapiens, 큐사피엔스)

> 서초구가 선정한 미래혁신형 북클럽. 서초·강남에서 오프라인으로 모여, 발제 질문을 중심으로 한 권의 책을 함께 읽고 대화합니다.

## 핵심 정보

- 운영: 질문하는 사람들 (Qsapiens)
- 지역: 서울 서초구·강남구 일대 오프라인 공간
- 형식: 한 권의 책과 발제 질문을 두고 나누는 북토크(독서모임), 작가와의 만남, 실습형 워크숍
- 참여 방법: 모임 상세 페이지(${SITE_URL}/bookclub)에서 일정·장소·참여비를 확인하고 참여 신청. 정원이 찬 모임은 대기 신청 가능
- 문의: junginaha@qsapiens.com

## 주요 페이지

- [홈](${SITE_URL}/): 다가오는 모임 일정과 위치
- [북클럽](${SITE_URL}/bookclub): 전체 모임 목록(예정·지난 모임)
- [질문](${SITE_URL}/questions): 커뮤니티가 남긴 질문 모음
- [2026→2027 은하수 히치하이커 독서여행](${SITE_URL}/reading-journey/2026-2027-hitchhiker): 더글러스 애덤스 《은하수를 여행하는 히치하이커를 위한 안내서》를 2026년 12월 12일부터 2027년 3월까지 4개월간 함께 읽는 SF 소설 북클럽 프로젝트(추천·모집 중, 세부 일시·장소 예정). 조용히 각자 읽는 모임 포함
${GIANTS_ENABLED ? `- [발제 생성기](${SITE_URL}/giants): 책 제목을 넣으면 독서모임용 발제 질문을 만들어 주는 도구\n` : ""}- [아카이브](${SITE_URL}/archive): 지난 모임의 후기·발제 기록
- [사이트맵](${SITE_URL}/sitemap.xml)

## 참여 안내

${activeGuides().map((g) => `- [${g.title}](${SITE_URL}/guide/${g.slug}): ${g.description}`).join("\n")}

## 예정 모임

${upcoming.length ? upcoming.map(sessionLines).join("\n") : "- 현재 공개된 예정 모임이 없습니다."}

## 2026~2027 북토크 — 여덟 달 연속 기획

매월 셋째 토요일 오전 10시–12시, 에피소드 강남 262(서울 서초구 강남대로 299), 참여비 20,000원. ${SITE_URL}/#talks 에서 회차별로 예약합니다. 각 회차는 위 "예정 모임"에 날짜와 함께 올라 있습니다.

## 우리 다시 만나요 — 열리기를 기다리는 책 (일정 미정)

회원 추천으로 고른 다음 책 후보입니다. ${SITE_URL}/#encore 의 "모이면 시작! 같이 읽어요"로 등록하면, 같은 책을 고른 분이 5명 이상 모일 때 북토크를 열고 안내합니다.

${UPCOMING_BOOKS.map((b) => `- 『${b.bookTitle}』${b.author ? ` (${b.author})` : ""} — ${b.pitch}`).join("\n")}

## 참여·취소·환불

- 예약: 모임 상세 페이지에서 카카오 또는 구글 로그인 후 신청합니다(비회원 예약 없음). 정원이 찬 모임은 대기 신청을 받습니다.
- 유료 모임: 예약 후 결제로 이어집니다. 참여비는 모임마다 다르며 각 모임 상세 페이지에 적혀 있습니다.
- 청약철회: 결제일부터 7일 이내 철회할 수 있습니다(전자상거래법 제17조 제1항). 모임이 시작된 뒤에는 제한됩니다(같은 조 제2항 제5호).
- 그 뒤의 취소: 「소비자분쟁해결기준」 공연업 기준을 따릅니다 — 모임 10일 전까지 전액, 9~7일 전 10% 공제, 6~3일 전 20% 공제, 2일 전~전날 30% 공제, 당일 시작 전 90% 공제. 10일 전 이후 신청했다면 신청 후 24시간 내 취소는 전액 환급입니다. 주최 측 사정으로 모임이 취소·변경되면 전액 환급합니다.
- 위 기준이 관계 법령이나 「소비자분쟁해결기준」과 다를 경우 이용자에게 유리한 쪽을 따릅니다.
- 전문: ${SITE_URL}/terms#refund

## 운영 주체

${businessLines().map((r) => `- ${r.label}: ${r.value}`).join("\n")}
- 개인정보처리방침: ${SITE_URL}/privacy
- 이용약관: ${SITE_URL}/terms

## 지난 모임

${past.length ? past.map(sessionLines).join("\n") : "- 아직 없습니다."}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
