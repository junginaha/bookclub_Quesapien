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

/**
 * 펼친 책에서 얼굴 꽃이 피어오르는 큰 손그림.
 *
 * 레퍼런스(chosecommune.com)의 구독 폼 옆 그림에서 가져온 한 수.
 * 거기서 배운 것:
 *  - 배지 크기가 아니라 **영역의 주인공**만큼 크다
 *  - 얼굴이 전부 다르다 — 웃고, 말하고, 눈을 감고, 안경을 썼다
 *  - 꽃줄기가 곧 **책장**이다. 책에서 자란 것이라는 뜻이 그림 안에 있다
 *
 * 격자에는 넣지 않는다(행렬이 흐트러진다) — 격자 아래 폼 옆 빈자리에 둔다.
 */
export function DoodleBookBloom({ className }: { className?: string }) {
  /**
   * 꽃이 주인공이고 책은 받침이다 — 처음엔 반대로 그려서 꽃이 뭉쳐 보였다.
   * 꽃은 원점(0,0) 기준으로 한 번만 그리고 translate+scale로 앉힌다.
   */
  const FLOWERS = [
    // cx, cy, 크기, 기울기, 꽃잎 각도(일부러 들쭉날쭉), 표정
    { x: 62, y: 72, k: 1.06, tilt: -7, petals: [4, 46, 86, 128, 170, 213, 256, 300, 338], face: "smile" },
    { x: 134, y: 48, k: 1.0, tilt: 5, petals: [12, 53, 97, 139, 180, 224, 267, 311], face: "talk" },
    { x: 203, y: 76, k: 1.1, tilt: -4, petals: [0, 43, 88, 127, 168, 214, 254, 297, 335], face: "rest" },
    { x: 252, y: 122, k: 0.94, tilt: 9, petals: [8, 51, 95, 135, 177, 221, 263, 306], face: "glasses" },
  ] as const;

  const FACES: Record<string, React.ReactNode> = {
    // 웃는 눈 + 작은 입
    smile: <path d="M-8.4 -5.4C-6.8 -7.6 -4.4 -7.6 -2.8 -5.6M2.8 -5.8C4.4 -8 6.8 -8 8.4 -6M-5 3.6C-2 6.6 2.2 6.6 5.2 3.4" />,
    // 말하는 중 — 눈썹이 서고 입이 열렸다
    talk: (
      <>
        <path d="M-9 -8.4C-6.2 -9.8 -3.6 -8.6 -2.6 -6.2M3.2 -9C6.2 -9.8 8.6 -8.2 9 -5.6" />
        <path d="M-3.4 3.4C-3.6 0.2 -1.2 -1.8 1.8 -1.6C4.8 -1.4 6.4 0.8 6 3.8C5.6 6.8 3 8.4 0.2 7.9C-2.4 7.4 -3.2 5.6 -3.4 3.4" />
      </>
    ),
    // 눈을 감고 생각하는 중
    rest: <path d="M-9 -4.4C-6 -1.8 -2.6 -1.8 0 -4.4M2.6 -4.8C5.4 -2.2 8.6 -2.2 11.2 -4.8M-5.2 4.6C-1.6 6.4 2.6 6 5.6 3.2" />,
    // 안경 — 알 둘, 원은 닫지 않는다
    glasses: (
      <>
        <path d="M-11.4 -5C-11.8 -8.8 -9.2 -11.6 -5.6 -11.4C-2.2 -11.2 -0.2 -8.6 -0.6 -5C-1 -1.6 -3.6 0.2 -6.8 -0.2C-9.6 -0.6 -11.2 -2.6 -11.4 -5" />
        <path d="M1.8 -4.6C1.6 -8.4 4.2 -11.2 7.8 -11C11.2 -10.8 13.2 -8.2 12.8 -4.6C12.4 -1.2 9.8 0.6 6.6 0.2C3.8 -0.2 2 -2.2 1.8 -4.6" />
        <path d="M-0.6 -6C0.8 -6.9 2.2 -6.9 1.8 -6" />
        <path d="M-5.4 6.4C-1.8 8.8 3.2 8.4 6.4 5.4" />
      </>
    ),
  };

  return (
    <svg
      className={className ? `qv3-bloom ${className}` : "qv3-bloom"}
      role="img"
      aria-label="펼친 책에서 얼굴을 한 꽃들이 피어오르는 그림"
      viewBox="0 0 300 252"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* 줄기는 직선이 아니라 **책장이 휘어 올라간 선**이다 — 책에서 자랐다는 뜻 */}
      <g strokeWidth="1.35">
        <path d="M150 186C140 152 112 108 66 82" />
        <path d="M150 186C147 146 140 96 133 60" />
        <path d="M150 186C161 150 178 112 199 88" />
        <path d="M150 186C176 171 214 146 245 132" />
        {/* 결 한 겹 더 — 한 번에 그은 선은 겹친다 */}
        <path d="M150 186C141 158 118 118 74 90" />
        <path d="M150 186C165 160 182 132 204 110" />
      </g>

      {/* 펼친 책 — 받침이다. 크지 않다. */}
      <path d="M150 186C133 179 108 176 78 177.4C76 177.5 75 178.6 75.1 180.3C75.7 193 76.3 206 76.9 219.4C77 221.2 78.1 222.1 80.1 222C109 220.6 133 223.6 150 230" />
      <path d="M150 186C167 178.6 192 175.6 222 177.1C224 177.2 225 178.3 224.9 180C224.3 192.8 223.7 205.8 223.1 219.1C223 220.9 221.9 221.8 219.9 221.7C191 220.4 167 223.4 150 230" />
      <path d="M150.2 186.5C150.1 201 150 215.6 150 230" />

      {FLOWERS.map((f) => (
        <g key={f.face} transform={`translate(${f.x} ${f.y}) rotate(${f.tilt}) scale(${f.k})`}>
          {f.petals.map((deg, i) => (
            <ellipse
              key={i}
              cx={0}
              cy={-32 - (i % 3)}
              rx={8.6 + (i % 3) * 0.6}
              ry={14.4 + (i % 2) * 1.1}
              transform={`rotate(${deg})`}
            />
          ))}
          {/* 꽃심 — 원은 닫지 않는다 */}
          <path d="M-17.4 0.6C-18.2 -9.4 -10.4 -17.6 -0.4 -17.9C9.8 -18.2 17.9 -10.6 18.1 -0.6C18.3 9.8 10.4 17.9 0.2 18.1C-9.4 18.3 -16.7 10.6 -17.4 0.6" />
          {FACES[f.face]}
        </g>
      ))}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   기능 컨트롤에 붙는 손그림.

   레퍼런스(chosecommune.com)에서 마지막에야 본 것: 그 사이트의 손그림은
   장식 자리가 아니라 **가장 기능적인 컨트롤 위에** 있다. 계정·장바구니·
   닫기·검색이 전부 손으로 그린 잉크를 PNG로 올린 것이고, 그중 찜 아이콘은
   아예 **자고 있는 하트**(눈을 감고 Zz)다. 서체는 Futura로 끝까지 단정한데
   손은 버튼 위에서만 떨린다 — 그 비율이 "서툴러 보이지만 뒤가 단단한" 인상을
   만든다.

   우리는 그 PNG를 가져오지 않는다(그쪽 그림이다). 가져오는 건 **자리**다.
   ───────────────────────────────────────────────────────────────────── */

/** 손으로 그린 돋보기. 원을 닫지 않고, 손잡이는 살짝 어긋나게 붙는다. */
export function DoodleSearch({ className }: { className?: string }) {
  return (
    <svg
      className={className ? `qv3-doodle ${className}` : "qv3-doodle"}
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* 한 번에 그은 원 — 시작점으로 정확히 돌아오지 않는다 */}
      <path d="M14.6 6.1C12.3 3.9 8.6 4.1 6.5 6.5C4.3 8.9 4.6 12.7 7.1 14.7C9.5 16.7 13.2 16.3 15.2 13.8C16.8 11.8 16.7 8.9 15.1 6.9" />
      {/* 손잡이 — 원에 닿기 전에 시작한다 */}
      <path d="M14.9 14.4C16.6 16.3 18.2 18.1 19.8 19.9" />
    </svg>
  );
}

/** 손으로 그은 가위표. 두 획이 교차점을 지나 조금씩 넘어간다. */
export function DoodleClose({ className }: { className?: string }) {
  return (
    <svg
      className={className ? `qv3-doodle ${className}` : "qv3-doodle"}
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    >
      <path d="M6.4 6.1C10 9.9 13.7 13.6 17.8 17.6" />
      <path d="M17.6 6.3C13.9 10.1 10.1 13.8 6.2 17.5" />
    </svg>
  );
}

/** 손으로 그은 메뉴 세 줄 — 길이가 제각각이고 끝이 안 맞는다. */
export function DoodleMenu({ open }: { open?: boolean }) {
  return (
    <svg
      className="qv3-doodle"
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    >
      {open ? (
        <>
          <path d="M6.4 6.1C10 9.9 13.7 13.6 17.8 17.6" />
          <path d="M17.6 6.3C13.9 10.1 10.1 13.8 6.2 17.5" />
        </>
      ) : (
        <>
          <path d="M4.2 7.4C9 7 14 7.2 19.6 7.1" />
          <path d="M4.5 12.1C8.6 11.8 13.2 12 18.2 11.9" />
          <path d="M4.1 16.8C9.4 16.4 14.6 16.7 19.8 16.5" />
        </>
      )}
    </svg>
  );
}
