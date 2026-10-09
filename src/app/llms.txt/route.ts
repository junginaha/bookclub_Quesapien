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
- 다시 함께 읽어요: 지난 북클럽의 책에 '다시 함께 읽기'를 신청하면, 같은 책을 고른 사람이 5명 모일 때 새 모임을 엽니다(이메일·문자·전화 중 선택해 안내)
- 문의: junginaha@qsapiens.com

## 주요 페이지

- [홈](${SITE_URL}/): 다가오는 모임 일정과 위치
- [북클럽](${SITE_URL}/bookclub): 전체 모임 목록(예정·지난 모임)
- [질문](${SITE_URL}/questions): 커뮤니티가 남긴 질문 모음
- [발제 생성기](${SITE_URL}/giants): 책 제목을 넣으면 독서모임용 발제 질문을 만들어 주는 도구
- [아카이브](${SITE_URL}/archive): 지난 모임의 후기·발제 기록
- [2026→2027 은하수 히치하이커 독서여행](${SITE_URL}/reading-journey/2026-2027-hitchhiker): 더글러스 애덤스 《은하수를 여행하는 히치하이커를 위한 안내서》를 2026년 12월 12일부터 2027년 3월까지 4개월간 함께 읽는 SF 소설 북클럽 프로젝트(추천·모집 중, 세부 일시·장소 예정). 조용히 각자 읽는 모임 포함
- [사이트맵](${SITE_URL}/sitemap.xml)

## 참여 안내

${activeGuides().map((g) => `- [${g.title}](${SITE_URL}/guide/${g.slug}): ${g.description}`).join("\n")}

## 예정 모임

${upcoming.length ? upcoming.map(sessionLines).join("\n") : "- 현재 공개된 예정 모임이 없습니다."}

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
