// Turbopack(이 프로젝트의 `next dev --turbopack`)에서는 sentry.client.config.ts가
// 동작하지 않으므로 Next.js의 instrumentation-client 파일 컨벤션을 사용한다.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  tracesSampleRate: 0.1,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
