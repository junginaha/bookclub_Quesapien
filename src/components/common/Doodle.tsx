/**
 * 손그림 마크 — 문장 안에 박히는 작은 그림.
 *
 * 배지가 아니라 **문장의 일부**로 쓴다. "마감 임박"이라고 쓰는 대신
 * 얼굴 하나를 글자 사이에 끼워 넣으면 같은 정보가 사람 손을 거친 것처럼 읽힌다.
 * 선은 일부러 떨리게 그렸고 원은 닫히지 않는다 — 자로 그은 선처럼 보이면 의미가 없다.
 *
 * 전부 인라인 SVG, 외부 이미지 없음. currentColor를 따라가므로 글자색과 같이 움직인다.
 */

export type DoodleKind = "open" | "soon" | "full" | "past";

const FACES: Record<DoodleKind, { ring: string; parts: string; label: string }> = {
  // 편안한 얼굴 — 아직 여유 있음
  open: {
    ring: "M13.6 2.8C18.7 3.5 21.8 7.6 21.3 12.5C20.8 17.4 16.6 21.4 11.5 21.1C6.5 20.8 2.6 16.7 2.9 11.6C3.2 6.7 7.3 2.8 12.7 2.7",
    parts: "M8.8 9.6C8.9 10.3 8.9 10.6 9 11.1M15.1 9.5C15.2 10.2 15.2 10.5 15.2 11M8.6 14.3C10.1 16.2 13.8 16.4 15.5 14.1",
    label: "여유 있는 얼굴",
  },
  // 서두르는 얼굴 — 곧 마감
  soon: {
    ring: "M13.4 2.6C18.6 3.1 22 7.3 21.4 12.4C20.8 17.5 16.4 21.5 11.3 21.1C6.4 20.7 2.5 16.5 3 11.5C3.4 6.6 7.6 2.7 12.9 2.6",
    parts: "M8.5 9.9C9.2 9.2 9.6 9.3 10.1 10M14 10C14.6 9.2 15.1 9.3 15.6 10M9.4 14.6C11 13.6 13.5 13.7 15 14.8C14.2 16.6 10.3 16.7 9.4 14.6Z",
    label: "서두르는 얼굴",
  },
  // 미안한 얼굴 — 자리가 다 참
  full: {
    ring: "M13.5 2.9C18.4 3.6 21.7 7.5 21.2 12.3C20.7 17.2 16.5 21.3 11.6 21C6.7 20.7 2.7 16.6 3 11.7C3.3 6.9 7.4 2.9 12.6 2.8",
    parts: "M8.7 9.7C8.8 10.4 8.8 10.7 8.9 11.2M15 9.6C15.1 10.3 15.1 10.6 15.2 11.1M9.1 15.9C10.6 14.3 13.6 14.2 15.2 15.7",
    label: "미안한 얼굴",
  },
  // 눈 감은 얼굴 — 지나간 모임
  past: {
    ring: "M13.3 3C18.3 3.5 21.6 7.6 21.1 12.4C20.6 17.1 16.4 21.2 11.5 20.9C6.6 20.6 2.8 16.5 3.1 11.7C3.4 7 7.5 3 12.8 2.9",
    parts: "M7.9 10.5C8.8 9.5 9.9 9.5 10.6 10.4M13.5 10.4C14.3 9.4 15.4 9.4 16.2 10.3M9.6 15.1C11.1 15.8 13.2 15.8 14.7 15",
    label: "눈 감은 얼굴",
  },
};

/** 문장 안에 끼워 넣는 손그림 얼굴. 글자와 같은 색·같은 줄에 앉는다. */
export function DoodleFace({ kind, title }: { kind: DoodleKind; title?: string }) {
  const f = FACES[kind];
  return (
    <svg
      className="qv3-doodle"
      role="img"
      aria-label={title ?? f.label}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={f.ring} />
      <path d={f.parts} />
    </svg>
  );
}

/** 자로 그은 선 대신 쓰는 손그림 밑줄. 폭에 맞춰 늘어난다. */
export function DoodleRule({ className }: { className?: string }) {
  return (
    <svg className={className ? `qv3-rule ${className}` : "qv3-rule"} aria-hidden="true" viewBox="0 0 240 5" preserveAspectRatio="none" fill="none">
      <path d="M1 3.1C31 1.4 61 4 91 2.4C121 .8 151 3.6 181 2.1C205 .9 221 3.4 239 2.2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

/** 빈 화면에 두는 손그림 — 펼친 책 한 권. */
export function DoodleBook() {
  return (
    <svg className="qv3-doodle-art" role="img" aria-label="펼쳐진 책 그림" viewBox="0 0 120 80" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M60 22C50 14.5 38 12 24 13.4C21.5 13.6 20 15 20 17.2C20.3 30 20.6 44 20.9 57.5C21 59.8 22.4 61 25 60.8C38 59.7 50 62 60 68" />
      <path d="M60 22C70 14.2 82 12 96 13.6C98.6 13.9 100 15.3 99.9 17.5C99.5 30.2 99.2 44 98.9 57.6C98.8 60 97.4 61.1 94.8 60.9C82 59.9 70 62.2 60 68" />
      <path d="M60 22.6C60.1 37.4 60.2 53 60.3 68" />
      <path d="M29 26.4C35.5 26 41.5 27 47 29.2M29 36.2C35.5 35.8 41.5 36.8 47 39M73 26.8C78.5 25.9 84.5 25.6 91 26M73 36.6C78.5 35.7 84.5 35.4 91 35.8" />
    </svg>
  );
}
