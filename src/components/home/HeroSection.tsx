"use client";

export default function HeroSection() {
  return (
    <section
      style={{
        minHeight: "100vh",
        paddingTop: "160px",
        paddingBottom: "80px",
        paddingLeft: "var(--gutter)",
        paddingRight: "var(--gutter)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {/* Floating paper particles - desktop only */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: "5%",
          top: "20%",
          pointerEvents: "none",
        }}
        className="hidden lg:block"
      >
        {/* Rectangles */}
        {[
          { w: 56, h: 72, delay: "0s", dur: "14s", top: "0px", right: "0px", rotate: "12deg" },
          { w: 40, h: 56, delay: "3s", dur: "16s", top: "100px", right: "80px", rotate: "-8deg" },
          { w: 32, h: 44, delay: "6s", dur: "12s", top: "220px", right: "20px", rotate: "5deg" },
        ].map((p, i) => (
          <div
            key={`rect-${i}`}
            style={{
              position: "absolute",
              width: `${p.w}px`,
              height: `${p.h}px`,
              top: p.top,
              right: p.right,
              transform: `rotate(${p.rotate})`,
              background: "var(--bg-soft)",
              border: "1px solid var(--line)",
              borderRadius: "2px",
              animation: `floaty ${p.dur} ease-in-out infinite`,
              animationDelay: p.delay,
            }}
          />
        ))}
        {/* Dots */}
        {[
          { size: 8, delay: "2s", top: "180px", right: "140px" },
          { size: 5, delay: "5s", top: "300px", right: "60px" },
        ].map((d, i) => (
          <div
            key={`dot-${i}`}
            style={{
              position: "absolute",
              width: `${d.size}px`,
              height: `${d.size}px`,
              top: d.top,
              right: d.right,
              borderRadius: "50%",
              background: "var(--line)",
              animation: `floaty 18s ease-in-out infinite`,
              animationDelay: d.delay,
            }}
          />
        ))}
      </div>

      {/* Scroll cue */}
      <div
        style={{
          position: "absolute",
          bottom: "48px",
          left: "var(--gutter)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
        }}
        className="hidden md:flex"
      >
        <span
          style={{
            fontSize: "9px",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "var(--muted-2)",
            fontFamily: "\"EB Garamond\", Georgia, serif",
            fontStyle: "italic",
            writingMode: "vertical-rl",
            textOrientation: "mixed",
          }}
        >
          SCROLL
        </span>
        <div
          style={{
            width: "1px",
            height: "48px",
            background: "var(--line)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "40%",
              background: "var(--muted)",
              animation: "slideDown 2s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        {/* Eyebrow row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "48px",
          }}
        >
          <span className="eyebrow">서초구 선정 미래혁신형 북클럽</span>
          <span className="eyebrow hidden sm:block">Vol. 04 · Seoul · Spring &apos;26</span>
        </div>

        {/* Main content grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "48px",
            alignItems: "flex-end",
          }}
        >
          {/* Left: headline + sub */}
          <div>
            <h1
              style={{
                fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                fontWeight: 300,
                fontSize: "clamp(44px, 7.6vw, 108px)",
                lineHeight: 1.1,
                color: "var(--ink)",
                letterSpacing: "-0.02em",
                marginBottom: "32px",
              }}
            >
              좋은{" "}
              <em
                style={{
                  fontFamily: "\"EB Garamond\", var(--font-eb-garamond), Georgia, serif",
                  fontStyle: "italic",
                  color: "var(--accent)",
                  position: "relative",
                  display: "inline-block",
                }}
              >
                질문
                <span
                  style={{
                    position: "absolute",
                    bottom: "-4px",
                    left: 0,
                    width: "100%",
                    height: "1px",
                    background:
                      "linear-gradient(90deg, transparent 0%, var(--accent) 30%, var(--gold) 50%, var(--accent) 70%, transparent 100%)",
                    backgroundSize: "200% auto",
                    animation: "shimmer 3.2s linear infinite",
                  }}
                />
              </em>
              은
              <br />
              좋은 사람을 데려옵니다.
            </h1>

            <p
              style={{
                fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                fontWeight: 300,
                fontSize: "clamp(16px, 1.8vw, 22px)",
                color: "var(--muted)",
                lineHeight: 1.7,
                maxWidth: "560px",
              }}
            >
              <span className="kw">질문</span>으로 연결되는 미래혁신형 북클럽.{" "}
              조용한 사람들이 가장 깊은 이야기를 시작합니다.
            </p>
          </div>

          {/* Right: CTA block */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "16px",
              minWidth: "200px",
            }}
            className="hidden md:flex"
          >
            <a
              href="#ask"
              onClick={(e) => {
                e.preventDefault();
                const el = document.querySelector("#ask");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="btn-primary-dark"
              style={{ fontSize: "15px", padding: "14px 28px" }}
            >
              지금 질문 참여하기
            </a>

            <a
              href="#books"
              onClick={(e) => {
                e.preventDefault();
                const el = document.querySelector("#books");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                fontSize: "12px",
                color: "var(--muted)",
                textDecoration: "none",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontFamily: "\"EB Garamond\", Georgia, serif",
                fontStyle: "italic",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--ink)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--muted)"; }}
            >
              SKIP →
            </a>

            <p
              style={{
                fontSize: "13px",
                color: "var(--muted-2)",
                fontFamily: "\"EB Garamond\", Georgia, serif",
                fontStyle: "italic",
              }}
            >
              — 생각보다 따뜻합니다.
            </p>
          </div>
        </div>

        {/* Mobile CTA */}
        <div
          style={{
            marginTop: "40px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
          className="md:hidden"
        >
          <a
            href="#ask"
            onClick={(e) => {
              e.preventDefault();
              const el = document.querySelector("#ask");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="btn-primary-dark"
          >
            지금 질문 참여하기
          </a>
          <a
            href="#books"
            onClick={(e) => {
              e.preventDefault();
              const el = document.querySelector("#books");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            style={{
              textAlign: "center",
              fontSize: "12px",
              color: "var(--muted)",
              textDecoration: "none",
              fontFamily: "\"EB Garamond\", Georgia, serif",
              fontStyle: "italic",
            }}
          >
            — 생각보다 따뜻합니다.
          </a>
        </div>
      </div>
    </section>
  );
}
