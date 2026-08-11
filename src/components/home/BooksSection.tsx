"use client";

import { useState } from "react";

interface BookMain {
  id: number;
  coverStyle: string;
  title: string;
  author: string;
  tag: string;
  recommender: string;
  quote: string;
  emotions: string[];
}

interface BookMini {
  id: number;
  coverStyle: string;
  title: string;
  author: string;
}

const MAIN_BOOKS: BookMain[] = [
  {
    id: 1,
    coverStyle: "linear-gradient(150deg, #1B2536 0%, #2A3A50 100%)",
    title: "파친코",
    author: "이민진",
    tag: "#이민사",
    recommender: "— Qsapiens가 건넵니다",
    quote: "우리가 어디서 왔는지를 알아야 어디로 가야 하는지 알 수 있습니다.",
    emotions: ["#신간", "#트렌드"],
  },
  {
    id: 2,
    coverStyle: "linear-gradient(150deg, #ECE5D7 0%, #D9CFBC 100%)",
    title: "채식주의자",
    author: "한강",
    tag: "#소설",
    recommender: "— 지영이 건넵니다",
    quote: "꿈속에서 나는 짐승이었고, 꿈에서 깨어나도 여전히 짐승이었다.",
    emotions: ["#위로", "#인간"],
  },
  {
    id: 3,
    coverStyle: "linear-gradient(150deg, #4A5240 0%, #6B7260 100%)",
    title: "아무튼, 여름",
    author: "김신회",
    tag: "#에세이",
    recommender: "— 성원이 건넵니다",
    quote: "계절이 바뀌어도 나는 언제나 여름을 기다린다.",
    emotions: ["#감성", "#일상"],
  },
  {
    id: 4,
    coverStyle: "linear-gradient(150deg, #7A3B2A 0%, #9A5040 100%)",
    title: "82년생 김지영",
    author: "조남주",
    tag: "#소설",
    recommender: "— 범이 건넵니다",
    quote: "그녀는 늘 달리고 있었다. 다만 트랙이 보이지 않을 뿐이었다.",
    emotions: ["#사회", "#관계"],
  },
  {
    id: 5,
    coverStyle: "linear-gradient(150deg, #2E3060 0%, #484A80 100%)",
    title: "미드나잇 라이브러리",
    author: "매트 헤이그",
    tag: "#소설",
    recommender: "— 상현이 건넵니다",
    quote: "인생에서 가장 용기 있는 결정은 계속 사는 것이다.",
    emotions: ["#위로", "#인생"],
  },
  {
    id: 6,
    coverStyle: "linear-gradient(150deg, #5A7060 0%, #7A9080 100%)",
    title: "소년이 온다",
    author: "한강",
    tag: "#역사",
    recommender: "— 한강이 건넵니다",
    quote: "살아남은 자의 슬픔은 죽은 자를 기억하는 것이다.",
    emotions: ["#역사", "#기억"],
  },
];

const MINI_COVERS = [
  "linear-gradient(150deg, #1B2536 0%, #2A3A50 100%)",
  "linear-gradient(150deg, #ECE5D7 0%, #D9CFBC 100%)",
  "linear-gradient(150deg, #4A5240 0%, #6B7260 100%)",
  "linear-gradient(150deg, #7A3B2A 0%, #9A5040 100%)",
  "linear-gradient(150deg, #2E3060 0%, #484A80 100%)",
  "linear-gradient(150deg, #5A7060 0%, #7A9080 100%)",
  "linear-gradient(150deg, #3D2B1F 0%, #5E4632 100%)",
  "linear-gradient(150deg, #B08A4A 0%, #C9A96E 100%)",
  "linear-gradient(150deg, #2A1F14 0%, #4A3526 100%)",
  "linear-gradient(150deg, #1C3440 0%, #2E5060 100%)",
  "linear-gradient(150deg, #4A2040 0%, #6A3060 100%)",
  "linear-gradient(150deg, #203828 0%, #305840 100%)",
];

const MINI_BOOKS: BookMini[] = [
  { id: 1, coverStyle: MINI_COVERS[0], title: "나는 나로 살기로 했다", author: "김수현" },
  { id: 2, coverStyle: MINI_COVERS[1], title: "데미안", author: "헤르만 헤세" },
  { id: 3, coverStyle: MINI_COVERS[2], title: "어린 왕자", author: "생텍쥐페리" },
  { id: 4, coverStyle: MINI_COVERS[3], title: "1984", author: "조지 오웰" },
  { id: 5, coverStyle: MINI_COVERS[4], title: "노르웨이의 숲", author: "무라카미 하루키" },
  { id: 6, coverStyle: MINI_COVERS[5], title: "아몬드", author: "손원평" },
  { id: 7, coverStyle: MINI_COVERS[6], title: "존재의 가벼움", author: "밀란 쿤데라" },
  { id: 8, coverStyle: MINI_COVERS[7], title: "작별하지 않는다", author: "한강" },
  { id: 9, coverStyle: MINI_COVERS[8], title: "불안", author: "알랭 드 보통" },
  { id: 10, coverStyle: MINI_COVERS[9], title: "킬링 코만단테", author: "이병률" },
  { id: 11, coverStyle: MINI_COVERS[10], title: "모순", author: "양귀자" },
  { id: 12, coverStyle: MINI_COVERS[11], title: "무기여 잘 있거라", author: "헤밍웨이" },
  { id: 13, coverStyle: MINI_COVERS[0], title: "사피엔스", author: "유발 하라리" },
  { id: 14, coverStyle: MINI_COVERS[1], title: "지적 대화를 위한 넓고 얕은 지식", author: "채사장" },
  { id: 15, coverStyle: MINI_COVERS[2], title: "철학이 필요한 시간", author: "강신주" },
  { id: 16, coverStyle: MINI_COVERS[3], title: "한 줌의 모래", author: "이사벨 아옌데" },
  { id: 17, coverStyle: MINI_COVERS[4], title: "탁월한 사유의 시선", author: "최진석" },
  { id: 18, coverStyle: MINI_COVERS[5], title: "고독의 위로", author: "에리히 프롬" },
  { id: 19, coverStyle: MINI_COVERS[6], title: "경계에서", author: "폴 틸리히" },
  { id: 20, coverStyle: MINI_COVERS[7], title: "지금 이 순간을 살아라", author: "에크하르트 톨레" },
  { id: 21, coverStyle: MINI_COVERS[8], title: "내가 확실히 아는 것들", author: "오프라 윈프리" },
  { id: 22, coverStyle: MINI_COVERS[9], title: "마음의 근육", author: "신형철" },
  { id: 23, coverStyle: MINI_COVERS[10], title: "달러구트 꿈 백화점", author: "이미예" },
  { id: 24, coverStyle: MINI_COVERS[11], title: "오늘 밤은 굶고 자야지", author: "박상영" },
];

export default function BooksSection() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section
      id="books"
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
            From Hand to Hand — 책을 건네는 마음
          </p>
          <h2
            style={{
              fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
              fontWeight: 300,
              fontSize: "clamp(28px, 3.8vw, 52px)",
              color: "var(--ink)",
              lineHeight: 1.25,
              letterSpacing: "-0.02em",
            }}
          >
            이 책을 누군가에게{" "}
            <span className="kw">꼭 건네고</span> 싶었던 이유.
          </h2>
        </div>

        {/* 3×2 Main book grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "24px",
            marginBottom: "48px",
          }}
          className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        >
          {MAIN_BOOKS.map((book) => {
            const isDark =
              book.coverStyle.includes("#1B2536") ||
              book.coverStyle.includes("#4A5240") ||
              book.coverStyle.includes("#7A3B2A") ||
              book.coverStyle.includes("#2E3060") ||
              book.coverStyle.includes("#5A7060");
            const textColor = isDark ? "rgba(236,227,207,0.9)" : "var(--ink)";
            const subColor = isDark ? "rgba(236,227,207,0.55)" : "var(--muted)";

            return (
              <div
                key={book.id}
                className="card-base reveal-on-scroll"
                style={{ border: "1px solid var(--line-soft)" }}
              >
                {/* Cover */}
                <div
                  style={{
                    background: book.coverStyle,
                    height: "200px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    padding: "20px",
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      fontSize: "10px",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: subColor,
                      fontFamily: "\"EB Garamond\", Georgia, serif",
                      fontStyle: "italic",
                      marginBottom: "8px",
                    }}
                  >
                    {book.tag}
                  </span>
                  <h3
                    style={{
                      fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                      fontWeight: 500,
                      fontSize: "20px",
                      color: textColor,
                      lineHeight: 1.2,
                      marginBottom: "4px",
                    }}
                  >
                    {book.title}
                  </h3>
                  <p style={{ fontSize: "12px", color: subColor }}>
                    {book.author}
                  </p>
                </div>

                {/* Info */}
                <div style={{ padding: "20px", background: "var(--bg-soft)" }}>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "var(--accent)",
                      fontFamily: "\"EB Garamond\", Georgia, serif",
                      fontStyle: "italic",
                      marginBottom: "10px",
                    }}
                  >
                    {book.recommender}
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--ink-soft)",
                      fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                      fontWeight: 300,
                      lineHeight: 1.6,
                      marginBottom: "14px",
                    }}
                  >
                    &ldquo;{book.quote}&rdquo;
                  </p>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {book.emotions.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: "10px",
                          color: "var(--muted)",
                          border: "1px solid var(--line)",
                          borderRadius: "9999px",
                          padding: "2px 10px",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Expand toggle */}
        <div style={{ textAlign: "center", marginBottom: expanded ? "40px" : "0" }}>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: "none",
              border: "1px solid var(--line)",
              borderRadius: "9999px",
              padding: "10px 28px",
              fontSize: "13px",
              color: "var(--muted)",
              cursor: "pointer",
              letterSpacing: "0.06em",
              transition: "border-color 0.2s, color 0.2s",
              fontFamily: "\"EB Garamond\", Georgia, serif",
              fontStyle: "italic",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
              (e.currentTarget as HTMLElement).style.color = "var(--accent)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--line)";
              (e.currentTarget as HTMLElement).style.color = "var(--muted)";
            }}
          >
            {expanded ? "접기" : `더보기 — 24권 더 있습니다`}
          </button>
        </div>

        {/* Mini books grid */}
        {expanded && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
            }}
            className="grid-cols-2 sm:grid-cols-3"
          >
            {MINI_BOOKS.map((book) => (
              <div
                key={book.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px",
                  border: "1px solid var(--line-soft)",
                  borderRadius: "4px",
                  background: "var(--bg-soft)",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "48px",
                    background: book.coverStyle,
                    borderRadius: "2px",
                    flexShrink: 0,
                  }}
                />
                <div>
                  <p
                    style={{
                      fontSize: "13px",
                      fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                      fontWeight: 500,
                      color: "var(--ink)",
                      lineHeight: 1.3,
                    }}
                  >
                    {book.title}
                  </p>
                  <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>
                    {book.author}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
