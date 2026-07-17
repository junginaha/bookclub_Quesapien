import { redirect } from "next/navigation";

// 2026-07-17 운영자 지시: 철학자 개별 상세 페이지(AI 대화·명언·위키 요약)는
// "발제 생성기(계산기 모드)"로 제품 방향이 바뀌면서 노출을 껐다. 코드는
// GiantDetailClient.tsx 등 git 히스토리에 남아있으나 라우트는 /giants(발제
// 생성기)로 리다이렉트한다. CLAUDE.md 절대 원칙 7(사망 70년 규칙 검증 전
// 신규 노출 금지)과도 부합 — 개별 인물 노출이 아예 사라졌으므로 리스크도 준다.
export default function GiantDetailPage() {
  redirect("/giants");
}
