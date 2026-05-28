"use client";

interface PastSeason {
  no: string;
  name: string;
  description: string;
  dates: string;
  status: "완료" | "진행중" | "준비중" | "모집예정";
}

const PAST_SEASONS: PastSeason[] = [
  {
    no: "Vol.03",
    name: "사랑 시즌",
    description: "사랑한다는 것, 사랑받는다는 것의 의미를 다시 묻다",
    dates: "2026.01 - 2026.03",
    status: "완료",
  },
  {
    no: "Vol.02",
    name: "AI와 인간",
    description: "기계가 감정을 이해할 수 있다면, 우리는 무엇이 되는가",
    dates: "2025.09 - 2025.12",
    status: "완료",
  },
  {
    no: "Vol.01",
    name: "관계",
    description: "우리는 왜 연결을 원하면서도 두려워하는가",
    dates: "2025.05 - 2025.08",
    status: "완료",
  },
  {
    no: "Vol.05",
    name: "인간이란",
    description: "인간을 인간이게 하는 것은 무엇인가",
    dates: "2026.07 예정",
    status: "준비중",
  },
  {
    no: "Vol.06",
    name: "창업의 두려움",
    description: "시작하는 용기, 실패하는 자유",
    dates: "2026.10 예정",
    status: "모집예정",
  },
];

const SEASON_QUESTIONS = [
  "당신은 마지막으로 언제 진심으로 외로웠나요?",
  "외로움과 고독은 어떻게 다를까요?",
  "당신을 살게 만든 관계는 어떤 것이었나요?",
  "혼자 있음이 외로움이 되는 순간은 언제인가요?",
];

const STATUS_COLORS: Record<PastSeason["status"], { bg: string; color: string }> = {
  완료: { bg: "rgba(94,70,50,0.08)", color: "var(--accent)" },
  진행중: { bg: "rgba(176,138,74,0.12)", color: "var(--gold)" },
  준비중: { bg: "rgba(123,114,104,0.08)", color: "var(--muted)" },
  모집예정: { bg: "rgba(123,114,104,0.06)", color: "var(--muted-2)" },
};

export default function SeasonsSection() {
  return (
    <section
      id="seasons"
      style={{
        background: "var(--bg-warm)",
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
            Seasons — 시즌
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
            지금, 우리가 함께 묻고 있는 질문
          </h2>
        </div>

        {/* Current season featured card */}
        <div
          className="reveal-on-scroll"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0",
            border: "1px solid var(--line)",
            borderRadius: "4px",
            overflow: "hidden",
            marginBottom: "48px",
            background: "var(--bg-soft)",
          }}
        >
          {/* Left: season info */}
          <div
            style={{
              padding: "48px",
              borderRight: "1px solid var(--line)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--gold)",
                  fontFamily: "\"EB Garamond\", Georgia, serif",
                  fontStyle: "italic",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "var(--gold)",
                    display: "inline-block",
                    animation: "blink 2s ease-in-out infinite",
                  }}
                />
                현재 진행중 · Vol.04
              </span>
            </div>

            <h3
              style={{
                fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                fontWeight: 500,
                fontSize: "clamp(24px, 2.8vw, 38px)",
                color: "var(--ink)",
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                marginBottom: "16px",
              }}
            >
              외로움 시즌
            </h3>
            <p
              style={{
                fontFamily: "\"EB Garamond\", var(--font-eb-garamond), Georgia, serif",
                fontStyle: "italic",
                fontSize: "16px",
                color: "var(--muted)",
                marginBottom: "32px",
                lineHeight: 1.5,
              }}
            >
              관계의 균열에서 시작되는 연결
            </p>

            {/* Meta columns */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "24px",
                marginBottom: "36px",
              }}
            >
              {[
                { label: "참여 인원", value: "47명" },
                { label: "기간", value: "2026.04 – 06" },
                { label: "총 모임", value: "8회" },
              ].map((meta) => (
                <div key={meta.label}>
                  <p style={{ fontSize: "10px", color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>
                    {meta.label}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                      fontWeight: 500,
                      fontSize: "18px",
                      color: "var(--ink)",
                    }}
                  >
                    {meta.value}
                  </p>
                </div>
              ))}
            </div>

            <a
              href="#ask"
              onClick={(e) => {
                e.preventDefault();
                const el = document.querySelector("#ask");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="btn-primary-dark"
              style={{ fontSize: "14px" }}
            >
              이번 시즌 참여하기
            </a>
          </div>

          {/* Right: season questions */}
          <div style={{ padding: "48px" }}>
            <p className="eyebrow" style={{ marginBottom: "24px" }}>
              이번 시즌의 질문들
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {SEASON_QUESTIONS.map((q, i) => (
                <div
                  key={i}
                  style={{
                    padding: "20px 0",
                    borderBottom: i < SEASON_QUESTIONS.length - 1 ? "1px solid var(--line-soft)" : "none",
                    display: "flex",
                    gap: "16px",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "\"EB Garamond\", Georgia, serif",
                      fontStyle: "italic",
                      fontSize: "14px",
                      color: "var(--muted-2)",
                      minWidth: "20px",
                      marginTop: "2px",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p
                    style={{
                      fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                      fontWeight: 300,
                      fontSize: "15px",
                      color: "var(--ink-soft)",
                      lineHeight: 1.6,
                    }}
                  >
                    {q}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Past seasons list */}
        <div>
          <p className="eyebrow" style={{ marginBottom: "24px" }}>
            Past Seasons — 지난 시즌
          </p>
          <div style={{ border: "1px solid var(--line)", borderRadius: "4px", overflow: "hidden" }}>
            {PAST_SEASONS.map((s, i) => {
              const sc = STATUS_COLORS[s.status];
              return (
                <div
                  key={s.no}
                  className="reveal-on-scroll"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "80px 1fr 1fr 160px 100px",
                    gap: "24px",
                    alignItems: "center",
                    padding: "20px 28px",
                    borderBottom: i < PAST_SEASONS.length - 1 ? "1px solid var(--line-soft)" : "none",
                    background: i % 2 === 0 ? "var(--bg-soft)" : "var(--bg-warm)",
                    transition: "background 0.15s",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "\"EB Garamond\", Georgia, serif",
                      fontStyle: "italic",
                      fontSize: "13px",
                      color: "var(--muted)",
                    }}
                  >
                    {s.no}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                      fontWeight: 500,
                      fontSize: "15px",
                      color: "var(--ink)",
                    }}
                  >
                    {s.name}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "var(--muted)",
                      fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                      fontWeight: 300,
                    }}
                  >
                    {s.description}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--muted-2)",
                      fontFamily: "\"EB Garamond\", Georgia, serif",
                      fontStyle: "italic",
                    }}
                  >
                    {s.dates}
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10.5px",
                      padding: "4px 12px",
                      borderRadius: "9999px",
                      background: sc.bg,
                      color: sc.color,
                      letterSpacing: "0.06em",
                    }}
                  >
                    {s.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
