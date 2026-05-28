"use client";

export default function CTASection() {
  return (
    <section
      style={{
        background: "var(--bg-navy)",
        paddingTop: "96px",
        paddingBottom: "96px",
        paddingLeft: "var(--gutter)",
        paddingRight: "var(--gutter)",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: "48px",
            alignItems: "center",
          }}
          className="grid-cols-1 md:grid-cols-[1fr_auto_1fr]"
        >
          {/* Quote 1 */}
          <div className="reveal-on-scroll">
            <p
              style={{
                fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                fontWeight: 300,
                fontSize: "clamp(18px, 2vw, 26px)",
                color: "var(--cream-on-dark)",
                lineHeight: 1.5,
                letterSpacing: "-0.01em",
              }}
            >
              질문은 가장{" "}
              <em
                style={{
                  fontFamily: "\"EB Garamond\", var(--font-eb-garamond), Georgia, serif",
                  fontStyle: "italic",
                  color: "var(--gold)",
                }}
              >
                인간적인
              </em>{" "}
              대화의 시작입니다.
            </p>
          </div>

          {/* Vertical divider */}
          <div
            style={{
              width: "1px",
              height: "100px",
              background: "rgba(255,255,255,0.12)",
              alignSelf: "stretch",
            }}
            className="hidden md:block"
          />

          {/* Quote 2 */}
          <div className="reveal-on-scroll">
            <p
              style={{
                fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                fontWeight: 300,
                fontSize: "clamp(18px, 2vw, 26px)",
                color: "var(--cream-on-dark)",
                lineHeight: 1.6,
                letterSpacing: "-0.01em",
              }}
            >
              누군가는{" "}
              <em
                style={{
                  fontFamily: "\"EB Garamond\", Georgia, serif",
                  fontStyle: "italic",
                  color: "var(--gold)",
                }}
              >
                답
              </em>
              으로 기억되고,
              <br />
              누군가는{" "}
              <em
                style={{
                  fontFamily: "\"EB Garamond\", Georgia, serif",
                  fontStyle: "italic",
                  color: "var(--gold)",
                }}
              >
                질문
              </em>
              으로 남습니다.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div
          style={{
            marginTop: "64px",
            textAlign: "center",
          }}
        >
          <a
            href="#books"
            onClick={(e) => {
              e.preventDefault();
              const el = document.querySelector("#books");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="btn-cream-pill"
            style={{ fontSize: "15px", padding: "14px 36px" }}
          >
            지금 참여하기
          </a>
        </div>
      </div>
    </section>
  );
}
