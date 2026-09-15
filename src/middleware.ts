import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { OLD_SLUG_REDIRECTS } from "@/lib/bookclubRedirects";

// next.config.ts의 redirects()로도 시도했지만, 이 프로젝트의 Next 15.5.18
// 프로덕션 서버에서는 /bookclub/[slug] 동적 라우트와 경로가 겹치는 문자열 리다이렉트가
// 적용되지 않는 현상이 확인됐다(재현: next build && next start 후 구 슬러그로 요청하면
// 308이 아니라 [slug] 페이지의 notFound()가 응답함). 미들웨어에서 먼저 처리해 우회한다.
//
// ⚠ 이 파일은 원래 프로젝트 루트(/middleware.ts)에 있었는데, tsconfig의
// baseUrl/paths(@/* -> ./src/*)가 src 디렉터리 구조를 쓰고 있어 Next 15는
// src/middleware.ts 위치만 인식한다 — 루트에 있으면 .next/server/middleware-manifest.json의
// "middleware"가 빈 객체로 나오고(직접 확인) 미들웨어가 아예 실행되지 않는다.
// 그래서 Supabase 세션 갱신(updateSession)도 이번 세션 전까지 프로덕션에서 조용히
// 동작하지 않고 있었을 가능성이 있다 — 이 파일 이동은 /bookclub 리다이렉트뿐 아니라
// 그 문제도 함께 고친다.
function bookclubRedirect(request: NextRequest): NextResponse | null {
  const match = request.nextUrl.pathname.match(/^\/bookclub\/([^/]+)\/?$/);
  if (!match) return null;
  const newSlug = OLD_SLUG_REDIRECTS[decodeURIComponent(match[1])];
  if (!newSlug) return null;
  const url = request.nextUrl.clone();
  url.pathname = `/bookclub/${newSlug}`;
  return NextResponse.redirect(url, 308);
}

export async function middleware(request: NextRequest) {
  const redirect = bookclubRedirect(request);
  if (redirect) return redirect;
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
