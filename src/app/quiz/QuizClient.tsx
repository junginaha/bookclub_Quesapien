"use client";

import { useState } from "react";
import Link from "next/link";
import type { BookMBTI } from "@/lib/supabase/types";
import "./quiz.css";

interface Question {
  id: string;
  text: string;
  options: { key: string; label: string; sub?: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: "1",
    text: "책을 읽을 때 가장 행복한 순간은?",
    options: [
      { key: "A", label: "감정이 풍부한 문장에 밑줄을 칠 때", sub: "마음이 흔들리는 그 순간" },
      { key: "B", label: "논리적 통찰을 발견할 때", sub: "퍼즐이 맞춰지는 느낌" },
      { key: "C", label: "새로운 세계관이 열릴 때", sub: "지평이 넓어지는 경험" },
      { key: "D", label: "누군가와 나누고 싶은 문장을 발견할 때", sub: "함께 읽고 싶어지는 순간" },
    ],
  },
  {
    id: "2",
    text: "북클럽에서 내가 하고 싶은 역할은?",
    options: [
      { key: "A", label: "감성적인 문장을 낭독하는 사람", sub: "소리 내어 읽을 때 더 깊어지는" },
      { key: "B", label: "핵심 논점을 정리하는 사람", sub: "생각을 구조화하는" },
      { key: "C", label: "전혀 다른 관점을 제시하는 사람", sub: "대화를 예상치 못한 곳으로 이끄는" },
      { key: "D", label: "모두가 편하게 말할 수 있도록 분위기를 만드는 사람", sub: "조용한 목소리도 들리게 하는" },
    ],
  },
  {
    id: "3",
    text: "혼자 있는 저녁, 어떤 책을 선택하나요?",
    options: [
      { key: "A", label: "시집이나 에세이", sub: "마음을 가만히 건드리는" },
      { key: "B", label: "철학서 또는 인문학", sub: "생각을 깊게 파고드는" },
      { key: "C", label: "분야를 가리지 않고 끌리는 것", sub: "오늘은 요리책, 내일은 과학" },
      { key: "D", label: "사람 이야기가 담긴 소설", sub: "살아있는 삶의 냄새가 나는" },
    ],
  },
  {
    id: "4",
    text: "책이 끝나고 제일 먼저 하는 일은?",
    options: [
      { key: "A", label: "마음에 담은 문장을 노트에 적는다", sub: "기록해야 살아남는 기억" },
      { key: "B", label: "핵심 개념을 정리해 본다", sub: "내 언어로 다시 쓰는" },
      { key: "C", label: "다음 읽을 책을 바로 찾는다", sub: "끝이 없는 독서 목록" },
      { key: "D", label: "주변 사람에게 이 책을 이야기한다", sub: "아는 사람이 먼저 떠오르는" },
    ],
  },
  {
    id: "5",
    text: "내 외로움의 색깔을 고른다면?",
    options: [
      { key: "A", label: "파랗고 조용한 색", sub: "고요하게 가라앉는" },
      { key: "B", label: "회색빛의 깊은 색", sub: "사유가 쌓이는 무게" },
      { key: "C", label: "알 수 없는 무지개색", sub: "어디로 튈지 모르는" },
      { key: "D", label: "따뜻하지만 묻혀있는 색", sub: "누군가에게 닿고 싶은" },
    ],
  },
];

interface MBTIProfile {
  type: BookMBTI;
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
  traits: string[];
  color: string;
  recommendedSlugs: string[];
  recommendedTitles: string[];
  quote: string;
}

const PROFILES: Record<BookMBTI, MBTIProfile> = {
  POET: {
    type: "POET",
    emoji: "🌙",
    title: "시인형",
    subtitle: "감성으로 읽는 독자",
    description: "당신은 책에서 논리보다 감정을 먼저 만납니다. 문장 하나에 오래 머무르고, 밑줄 친 구절이 삶을 바꾸기도 합니다. 당신의 독서는 내면을 향한 긴 여행입니다.",
    traits: ["감성 충만한 문장에 반응", "시와 에세이를 사랑함", "읽은 것을 오래 품음", "혼자 읽는 시간이 충전됨"],
    color: "dusk",
    recommendedSlugs: ["다정함의-발명", "오늘-저녁-당신께", "밤에만-편지를-씁니다", "어머니의-문장들"],
    recommendedTitles: ["다정함의 발명", "오늘 저녁, 당신께", "밤에만 편지를 씁니다", "어머니의 문장들"],
    quote: "\"한 페이지에서 일주일을 머문 적이 있어요.\"",
  },
  SAGE: {
    type: "SAGE",
    emoji: "🔭",
    title: "탐구자형",
    subtitle: "깊이 사유하는 독자",
    description: "당신은 책을 통해 세상의 구조를 이해하고 싶습니다. 쉬운 답보다 더 나은 질문을 찾고, 사유의 깊이가 삶의 깊이라고 믿습니다.",
    traits: ["철학·인문학 애독자", "핵심 논점 정리가 자연스러움", "깊은 대화를 선호", "혼자만의 사색 시간이 필요함"],
    color: "rust",
    recommendedSlugs: ["혼자라는-감각", "인간이라는-풍경", "철학이-필요한-저녁", "흐린-날의-사유"],
    recommendedTitles: ["혼자라는 감각", "인간이라는 풍경", "철학이 필요한 저녁", "흐린 날의 사유"],
    quote: "\"고독을 결핍이 아니라 깊이로 다루는 책.\"",
  },
  SEEKER: {
    type: "SEEKER",
    emoji: "🌐",
    title: "탐험가형",
    subtitle: "경계를 넘는 독자",
    description: "당신에게 장르는 제약이 아닙니다. 오늘은 요리책, 내일은 과학서. 끌리는 것을 따라가다 보면 예상치 못한 연결이 생깁니다. 독서가 세계 탐험입니다.",
    traits: ["장르 불문 독서", "새로운 관점에 열려있음", "대화를 예상치 못한 곳으로 이끔", "독서 목록이 끝이 없음"],
    color: "olive",
    recommendedSlugs: ["최신간-북토크", "아무것도-하지-않는-연습", "외국어로-읽는-한국-소설", "도시의-올랜-해"],
    recommendedTitles: ["최신간 북토크", "아무것도 하지 않는 연습", "외국어로 읽는 한국 소설", "도시의 올랜 해"],
    quote: "\"새벽 세 시에 깨어 있는 사람만 아는 문장.\"",
  },
  BRIDGE: {
    type: "BRIDGE",
    emoji: "🤝",
    title: "연결자형",
    subtitle: "사람으로 읽는 독자",
    description: "당신은 책에서 언제나 사람을 찾습니다. 읽은 것을 나누고 싶고, 같은 문장에 다른 반응을 보이는 사람들이 신기합니다. 북클럽은 당신을 위한 공간입니다.",
    traits: ["읽은 책을 꼭 누군가에게 이야기함", "관계·회고·사람 이야기 선호", "북클럽에서 빛남", "대화가 책만큼 중요함"],
    color: "sage",
    recommendedSlugs: ["아무도-보지-않는-오후", "제자리로-돌아오는-밤에", "헤어진-이들의-재회", "이름-없는-감정들에게"],
    recommendedTitles: ["아무도 보지 않는 오후", "제자리로 돌아오는 밤에", "헤어진 이들의 재회", "이름 없는 감정들에게"],
    quote: "\"'사람은 아직 믿을 만하다'는 감각을 4년 만에 느꼈습니다.\"",
  },
};

type Step = "intro" | "quiz" | "result";

export default function QuizClient() {
  const [step, setStep] = useState<Step>("intro");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<MBTIProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const progress = ((current) / QUESTIONS.length) * 100;

  const handleAnswer = async (key: string) => {
    setSelected(key);
    const newAnswers = { ...answers, [QUESTIONS[current].id]: key };

    await new Promise((r) => setTimeout(r, 380));

    if (current < QUESTIONS.length - 1) {
      setAnswers(newAnswers);
      setCurrent((c) => c + 1);
      setSelected(null);
    } else {
      setAnswers(newAnswers);
      setLoading(true);
      try {
        const res = await fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers: newAnswers,
            session_key: typeof window !== "undefined"
              ? `q_${Math.random().toString(36).slice(2)}`
              : undefined,
          }),
        });
        const data = await res.json() as { mbti_type: BookMBTI };
        setResult(PROFILES[data.mbti_type]);
      } catch {
        // Fallback: calculate client-side
        const counts: Record<BookMBTI, number> = { POET: 0, SAGE: 0, SEEKER: 0, BRIDGE: 0 };
        const map: Record<string, BookMBTI> = {
          A: "POET", B: "SAGE", C: "SEEKER", D: "BRIDGE",
        };
        for (const v of Object.values(newAnswers)) {
          if (map[v]) counts[map[v]]++;
        }
        const type = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as BookMBTI;
        setResult(PROFILES[type]);
      }
      setLoading(false);
      setStep("result");
    }
  };

  const restart = () => {
    setStep("intro");
    setCurrent(0);
    setAnswers({});
    setResult(null);
    setSelected(null);
  };

  if (step === "intro") {
    return (
      <div className="qz">
        <div className="qz-grain" aria-hidden />
        <div className="qz-intro">
          <div className="qz-eyebrow">BOOK MBTI — 나에게 맞는 북클럽</div>
          <h1 className="qz-h1">당신은 어떤<br /><em>독자</em>인가요?</h1>
          <p className="qz-lede">
            5개의 질문으로 당신의 독서 성향을 파악하고,<br />
            꼭 맞는 북클럽과 이벤트를 추천해드립니다.
          </p>
          <div className="qz-meta-row">
            <span>소요 시간 약 3분</span>
            <span>·</span>
            <span>5가지 질문</span>
            <span>·</span>
            <span>4가지 유형</span>
          </div>
          <div className="qz-intro-ctas">
            <button className="qz-btn-start" onClick={() => setStep("quiz")}>
              시작하기
              <span className="qz-arrow" />
            </button>
            <Link href="/#books" className="qz-btn-skip">
              건너뛰고 북클럽 보기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (step === "quiz") {
    const q = QUESTIONS[current];
    return (
      <div className="qz">
        <div className="qz-grain" aria-hidden />
        <div className="qz-quiz-wrap">
          {/* Progress */}
          <div className="qz-progress-wrap">
            <div className="qz-progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <div className="qz-num">{current + 1} / {QUESTIONS.length}</div>

          {/* Skip */}
          <Link href="/#books" className="qz-skip-link">언제든 SKIP →</Link>

          <div className="qz-question-card">
            <p className="qz-q-text">{q.text}</p>
            <div className="qz-options">
              {q.options.map((opt) => (
                <button
                  key={opt.key}
                  className={`qz-option${selected === opt.key ? " selected" : ""}`}
                  onClick={() => handleAnswer(opt.key)}
                  disabled={selected !== null}
                >
                  <span className="qz-opt-key">{opt.key}</span>
                  <span className="qz-opt-body">
                    <span className="qz-opt-label">{opt.label}</span>
                    {opt.sub && <span className="qz-opt-sub">{opt.sub}</span>}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Link href="/#books" className="qz-btn-skip qz-skip-bottom">
            결과 건너뛰고 북클럽 바로 보기
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="qz">
        <div className="qz-grain" aria-hidden />
        <div className="qz-loading">
          <div className="qz-loading-mark">?!</div>
          <p>당신의 독서 유형을 분석 중입니다…</p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="qz qz-result-page">
      <div className="qz-grain" aria-hidden />
      <div className="qz-result-wrap">
        <div className="qz-eyebrow">당신의 북 MBTI는</div>
        <div className={`qz-result-card qz-card-${result.color}`}>
          <div className="qzr-emoji">{result.emoji}</div>
          <div className="qzr-type">{result.type}</div>
          <div className="qzr-title">{result.title}</div>
          <div className="qzr-subtitle">{result.subtitle}</div>
        </div>

        <p className="qz-result-desc">{result.description}</p>

        <div className="qzr-traits">
          {result.traits.map((t) => (
            <span key={t} className="qzr-trait">{t}</span>
          ))}
        </div>

        <blockquote className="qzr-quote">{result.quote}</blockquote>

        <div className="qzr-rec-section">
          <div className="qzr-rec-label">— 추천 북클럽</div>
          <div className="qzr-rec-list">
            {result.recommendedTitles.map((title, i) => (
              <Link
                key={title}
                href={`/#books`}
                className="qzr-rec-item"
              >
                <span className={`qzr-rec-spine qzr-spine-${i % 4}`} />
                <span className="qzr-rec-title">{title}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="qzr-ctas">
          <Link href="/#books" className="qz-btn-start">
            북클럽 참여하기
            <span className="qz-arrow" />
          </Link>
          <button className="qz-btn-retry" onClick={restart}>
            다시 테스트하기
          </button>
        </div>
      </div>
    </div>
  );
}
