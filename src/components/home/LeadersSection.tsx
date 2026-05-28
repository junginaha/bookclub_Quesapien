interface Leader {
  initial: string;
  name: string;
  role: string;
  philosophy: string;
  question: string;
}

const LEADERS: Leader[] = [
  {
    initial: "J",
    name: "정지혜",
    role: "클럽 리더",
    philosophy: "정답보다 진심을 믿습니다",
    question: "우리는 왜 타인에게 인정받고 싶어할까요?",
  },
  {
    initial: "S",
    name: "손민준",
    role: "질문 큐레이터",
    philosophy: "좋은 질문은 답을 이기는 법이 없습니다",
    question:
      "AI가 감정을 이해할 수 있다면, 인간의 감정은 어떤 의미를 가질까요?",
  },
  {
    initial: "Y",
    name: "윤채원",
    role: "시즌 기획자",
    philosophy: "침묵도 대화입니다",
    question: "당신이 절대 포기하지 못하는 것은 무엇인가요?",
  },
];

export default function LeadersSection() {
  return (
    <section
      id="leaders"
      style={{
        paddingTop: "96px",
        paddingBottom: "96px",
        paddingLeft: "var(--gutter)",
        paddingRight: "var(--gutter)",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "56px" }}>
          <p className="eyebrow" style={{ marginBottom: "16px" }}>
            Leaders — 리더
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
            질문을 이끄는 사람들
          </h2>
        </div>

        {/* Leader cards grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "24px",
          }}
          className="grid-cols-1 md:grid-cols-3"
        >
          {LEADERS.map((leader) => (
            <div
              key={leader.name}
              className="card-base reveal-on-scroll"
              style={{
                padding: "36px 32px",
                background: "var(--bg-soft)",
                border: "1px solid var(--line-soft)",
                display: "flex",
                flexDirection: "column",
                gap: "24px",
              }}
            >
              {/* Initial circle */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    border: "1px dashed var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "\"EB Garamond\", var(--font-eb-garamond), Georgia, serif",
                      fontStyle: "italic",
                      fontSize: "24px",
                      color: "var(--accent)",
                    }}
                  >
                    {leader.initial}
                  </span>
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                      fontWeight: 500,
                      fontSize: "17px",
                      color: "var(--ink)",
                      marginBottom: "4px",
                    }}
                  >
                    {leader.name}
                  </p>
                  <p
                    style={{
                      fontFamily: "\"EB Garamond\", Georgia, serif",
                      fontStyle: "italic",
                      fontSize: "13px",
                      color: "var(--muted)",
                    }}
                  >
                    {leader.role}
                  </p>
                </div>
              </div>

              {/* Philosophy */}
              <div
                style={{
                  borderTop: "1px solid var(--line)",
                  borderBottom: "1px solid var(--line)",
                  padding: "20px 0",
                  position: "relative",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: "12px",
                    left: "0",
                    fontFamily: "\"EB Garamond\", Georgia, serif",
                    fontSize: "48px",
                    color: "var(--line)",
                    lineHeight: 1,
                  }}
                >
                  &ldquo;
                </span>
                <p
                  style={{
                    fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                    fontWeight: 300,
                    fontSize: "15px",
                    color: "var(--ink-soft)",
                    lineHeight: 1.6,
                    paddingLeft: "28px",
                    paddingTop: "8px",
                  }}
                >
                  {leader.philosophy}
                </p>
              </div>

              {/* Representative question */}
              <div>
                <p className="eyebrow" style={{ marginBottom: "10px" }}>
                  대표 질문
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                    fontWeight: 300,
                    fontSize: "14px",
                    color: "var(--ink-soft)",
                    lineHeight: 1.65,
                  }}
                >
                  {leader.question}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
