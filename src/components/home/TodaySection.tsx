interface CommentPreview {
  nickname: string;
  text: string;
}

interface SmallQuestion {
  no: string;
  text: string;
}

const COMMENTS: CommentPreview[] = [
  { nickname: "정우성", text: "대학교 1학년 수능 결과를 본 날 밤이었어요." },
  { nickname: "김민아", text: "생각해보니 꽤 오래됐네요. 그때 뭔가 무너진 것 같아서." },
  { nickname: "이서연", text: "작년에 강아지를 보내고 나서요. 혼자 한참을 울었습니다." },
];

const SMALL_QUESTIONS: SmallQuestion[] = [
  { no: "02", text: "당신은 지금 어떤 관계를 가장 두려워하고 있나요?" },
  { no: "03", text: "지금 가장 이해받고 싶은 것은 무엇인가요?" },
  { no: "04", text: "10년 후의 나에게 가장 묻고 싶은 질문은?" },
];

export default function TodaySection() {
  return (
    <section
      id="today"
      style={{
        paddingTop: "96px",
        paddingBottom: "96px",
        paddingLeft: "var(--gutter)",
        paddingRight: "var(--gutter)",
        borderTop: "1px solid var(--line)",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "56px" }}>
          <p className="eyebrow" style={{ marginBottom: "16px" }}>
            Today&apos;s Question — 오늘의 질문
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
            하루에 한 번, 마음을 흔드는 질문
          </h2>
        </div>

        {/* 2-column grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
          }}
          className="grid-cols-1 lg:grid-cols-2"
        >
          {/* Left: featured question card */}
          <div
            className="reveal-on-scroll"
            style={{
              background: "var(--bg-soft)",
              border: "1px solid var(--line)",
              borderRadius: "4px",
              padding: "40px",
              display: "flex",
              flexDirection: "column",
              gap: "28px",
            }}
          >
            {/* Pulse marker */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ position: "relative", width: "10px", height: "10px" }}>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: "var(--gold)",
                    animation: "pulseExpand 2.4s ease-out infinite",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: "var(--gold)",
                  }}
                />
              </div>
              <span className="eyebrow">오늘의 질문</span>
            </div>

            {/* Main question */}
            <div>
              <p
                style={{
                  fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                  fontWeight: 300,
                  fontSize: "clamp(20px, 2.4vw, 30px)",
                  color: "var(--ink)",
                  lineHeight: 1.5,
                  letterSpacing: "-0.01em",
                }}
              >
                <em
                  style={{
                    fontFamily: "\"EB Garamond\", Georgia, serif",
                    fontStyle: "italic",
                    color: "var(--accent)",
                    fontSize: "1.15em",
                  }}
                >
                  당
                </em>
                신은 마지막으로 언제 진심으로 울었나요?
              </p>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: "20px" }}>
              {[
                { label: "공감", value: "143" },
                { label: "저장", value: "67" },
                { label: "답변", value: "89" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p
                    style={{
                      fontFamily: "\"EB Garamond\", Georgia, serif",
                      fontSize: "20px",
                      fontWeight: 600,
                      color: "var(--accent)",
                    }}
                  >
                    {stat.value}
                  </p>
                  <p style={{ fontSize: "10px", color: "var(--muted)", letterSpacing: "0.08em" }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Comment previews */}
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: "24px" }}>
              <p className="eyebrow" style={{ marginBottom: "16px" }}>
                답변 미리보기
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {COMMENTS.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "14px 0",
                      borderBottom:
                        i < COMMENTS.length - 1
                          ? "1px dashed var(--line-soft)"
                          : "none",
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                    }}
                  >
                    <em
                      style={{
                        fontFamily: "\"EB Garamond\", Georgia, serif",
                        fontStyle: "italic",
                        fontSize: "13px",
                        color: "var(--accent)",
                        whiteSpace: "nowrap",
                        marginTop: "1px",
                      }}
                    >
                      {c.nickname}
                    </em>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "var(--ink-soft)",
                        fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                        fontWeight: 300,
                        lineHeight: 1.5,
                      }}
                    >
                      {c.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: small question cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {SMALL_QUESTIONS.map((q) => (
              <div
                key={q.no}
                className="card-base reveal-on-scroll"
                style={{
                  border: "1px solid var(--line-soft)",
                  borderRadius: "4px",
                  padding: "28px",
                  background: "var(--bg)",
                  flex: 1,
                  display: "flex",
                  gap: "20px",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    fontFamily: "\"EB Garamond\", Georgia, serif",
                    fontStyle: "italic",
                    fontSize: "28px",
                    color: "var(--line)",
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                >
                  {q.no}
                </span>
                <p
                  style={{
                    fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                    fontWeight: 300,
                    fontSize: "16px",
                    color: "var(--ink-soft)",
                    lineHeight: 1.6,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {q.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
