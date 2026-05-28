interface Testimonial {
  id: number;
  nickname: string;
  occupation: string;
  quote: string;
  seasonInfo: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    nickname: "이서연",
    occupation: "30대 · 마케터",
    quote:
      "처음으로 솔직한 대화를 했어요. 모르는 사람과 이렇게 깊은 이야기를 나눌 수 있다는 게 놀라웠습니다.",
    seasonInfo: "외로움 시즌 · 3주차",
  },
  {
    id: 2,
    nickname: "박준혁",
    occupation: "20대 · 개발자",
    quote:
      "사람을 다시 믿게 됐습니다. 질문 하나가 삶을 흔들 수 있다는 걸 처음 알았어요.",
    seasonInfo: "사랑 시즌 · 5주차",
  },
  {
    id: 3,
    nickname: "김민아",
    occupation: "30대 · 디자이너",
    quote:
      "조용한 공간에서 조용한 사람들과 조용하게 깊어졌어요.",
    seasonInfo: "AI와 인간 시즌 · 2주차",
  },
  {
    id: 4,
    nickname: "정우성",
    occupation: "40대 · 작가",
    quote:
      "질문 하나가 삶을 흔들었습니다. 그 무게를 같이 들어준 사람들이 있었어요.",
    seasonInfo: "인간 시즌 · 7주차",
  },
  {
    id: 5,
    nickname: "최유진",
    occupation: "20대 · 학생",
    quote:
      "여기 와서야 내 이야기를 꺼낼 수 있었습니다. 들어주는 사람들이 있다는 것만으로도.",
    seasonInfo: "관계 시즌 · 1주차",
  },
];

export default function TestimonialsSection() {
  return (
    <section
      style={{
        paddingTop: "96px",
        paddingBottom: "96px",
        paddingLeft: "var(--gutter)",
        paddingRight: "var(--gutter)",
        borderTop: "1px solid var(--line)",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "56px" }}>
          <p className="eyebrow" style={{ marginBottom: "16px" }}>
            Testimonials
          </p>
          <h2
            style={{
              fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
              fontWeight: 300,
              fontSize: "clamp(24px, 3.2vw, 44px)",
              color: "var(--ink)",
              letterSpacing: "-0.02em",
            }}
          >
            사람들이 남기고 간 변화
          </h2>
        </div>

        <div>
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.id}
              className="reveal-on-scroll"
              style={{
                display: "grid",
                gridTemplateColumns: "180px 1fr 180px",
                gap: "32px",
                alignItems: "start",
                padding: "40px 0",
                borderTop: "1px solid var(--line)",
                borderBottom: i === TESTIMONIALS.length - 1 ? "1px solid var(--line)" : "none",
              }}
            >
              {/* Left: nickname + occupation */}
              <div>
                <p
                  style={{
                    fontFamily: "\"EB Garamond\", var(--font-eb-garamond), Georgia, serif",
                    fontStyle: "italic",
                    fontSize: "18px",
                    color: "var(--accent)",
                    marginBottom: "6px",
                  }}
                >
                  {t.nickname}
                </p>
                <p
                  style={{
                    fontSize: "11.5px",
                    color: "var(--muted)",
                    letterSpacing: "0.04em",
                  }}
                >
                  {t.occupation}
                </p>
              </div>

              {/* Center: quote */}
              <p
                style={{
                  fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                  fontWeight: 300,
                  fontSize: "clamp(15px, 1.6vw, 20px)",
                  color: "var(--ink-soft)",
                  lineHeight: 1.7,
                }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Right: season info */}
              <div style={{ textAlign: "right" }}>
                <p
                  style={{
                    fontFamily: "\"EB Garamond\", var(--font-eb-garamond), Georgia, serif",
                    fontStyle: "italic",
                    fontSize: "13px",
                    color: "var(--muted-2)",
                    lineHeight: 1.5,
                  }}
                >
                  {t.seasonInfo}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
