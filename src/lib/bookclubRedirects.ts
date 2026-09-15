// 구 한글 슬러그 → 신규 영문 슬러그. next.config.ts(redirects())와
// src/lib/bookclubs.ts 양쪽에서 이 파일만 본다 — next.config.ts는 Next 번들러
// 밖(plain Node)에서 로드되므로 의존성 없는 별도 파일로 분리했다
// (bookclubs.ts는 @/lib/supabase/server를 import해서 next.config.ts에 직접
// 넣을 수 없다).
export const OLD_SLUG_REDIRECTS: Record<string, string> = {
  "위험한-리더는-어떻게-만들어지는가": "dangerous-leaders",
  "나는-메트로폴리탄-미술관의-경비원입니다": "met-guard",
  "어떻게-민주주의는-무너지는가": "democracies-die",
  "게으름에-대한-찬양": "praise-of-idleness",
  "오직-나를-위한-미술관": "museum-for-me",
};
