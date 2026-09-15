import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// 구 북클럽 한글 슬러그 → 신규 영문 슬러그 308 리다이렉트는 여기(redirects())가 아니라
// middleware.ts에서 처리한다 — /bookclub/[slug] 동적 라우트와 경로가 겹치는 문자열
// redirects()가 이 Next 버전(15.5.18) 프로덕션 서버에서 적용되지 않는 현상이 확인됐다
// (재현: next build && next start 후 구 슬러그 요청 시 308이 아니라 [slug]의
// notFound()가 응답함). middleware.ts의 bookclubRedirect()가 실제 처리를 맡는다.

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "www.qsapiens.com", "qsapiens.com"],
    },
  },
};

// org/project/auth token이 없으면 소스맵 업로드 등 빌드 플러그인은 조용히 스킵된다.
export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  disableLogger: true,
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
});
