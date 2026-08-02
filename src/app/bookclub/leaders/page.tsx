import { redirect } from "next/navigation";

// 2026-08-02 운영자 지시: 북클럽에서 리더 개인 이름 노출을 전면 중단하면서,
// 존재 목적 자체가 "리더 이름·프로필 소개"였던 이 페이지는 노출을 껐다.
// 코드는 LeadersClient.tsx에 git 히스토리로 남아있으나 라우트는 /bookclub로
// 리다이렉트한다(/giants/[person] 블라인드 리다이렉트와 동일 패턴).
export default function LeadersPage() {
  redirect("/bookclub");
}
