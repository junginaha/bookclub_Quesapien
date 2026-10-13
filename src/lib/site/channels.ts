// 모임 기록 채널 — 아카이빙은 자체 업로드 대신 외부 채널 링크로만 제공한다.
// 운영자가 주소를 확정하면 여기만 채우면 된다. 빈 값이면 해당 링크를 숨긴다.
export const RECORD_CHANNELS: { label: string; href: string }[] = [
  { label: "유튜브", href: process.env.NEXT_PUBLIC_YOUTUBE_URL ?? "" },
  { label: "블로그", href: process.env.NEXT_PUBLIC_BLOG_URL ?? "" },
].filter((channel) => channel.href.startsWith("https://"));
