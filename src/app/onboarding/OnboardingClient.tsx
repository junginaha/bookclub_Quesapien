"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface OnboardingQuestion {
  id: string;
  question: string;
  hint: string;
  type: "text" | "choice" | "multi";
  options?: string[];
  dnaTag: string;
}

const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: "q1",
    question: "최근 가장 자주 하는 질문은 무엇인가요?",
    hint: "마음 속에서 반복되는 질문을 그대로 적어주세요.",
    type: "text",
    dnaTag: "existential",
  },
  {
    id: "q2",
    question: "당신이 자주 읽는 분야는?",
    hint: "여러 개 선택 가능합니다.",
    type: "multi",
    options: ["철학 · 사상", "소설 · 문학", "경제 · 경영", "과학 · 기술", "역사 · 인문", "심리 · 자기계발", "시 · 에세이", "종교 · 영성"],
    dnaTag: "reading",
  },
  {
    id: "q3",
    question: "현재 가장 관심 있는 주제는?",
    hint: "지금 이 시기에 당신을 사로잡는 것.",
    type: "choice",
    options: ["관계와 사랑", "일과 커리어", "자아와 정체성", "삶의 의미", "창조와 예술", "사회와 변화"],
    dnaTag: "interest",
  },
  {
    id: "q4",
    question: "어떤 사람을 만나고 싶나요?",
    hint: "북토크에서 어떤 사람과 대화하고 싶은지 생각해보세요.",
    type: "text",
    dnaTag: "social",
  },
  {
    id: "q5",
    question: "현재 가장 큰 고민은?",
    hint: "솔직하게 적어주세요. 당신만 볼 수 있습니다.",
    type: "text",
    dnaTag: "concern",
  },
];

export default function OnboardingClient() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [currentText, setCurrentText] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const question = ONBOARDING_QUESTIONS[step];
  const isLast = step === ONBOARDING_QUESTIONS.length - 1;
  const progress = ((step + 1) / ONBOARDING_QUESTIONS.length) * 100;

  const canProceed = () => {
    if (question.type === "text") return currentText.trim().length >= 2;
    if (question.type === "choice") return selectedOptions.length === 1;
    if (question.type === "multi") return selectedOptions.length >= 1;
    return false;
  };

  const handleNext = async () => {
    const answer = question.type === "text" ? currentText : selectedOptions;
    const newAnswers = { ...answers, [question.id]: answer };
    setAnswers(newAnswers);

    if (isLast) {
      setIsSubmitting(true);
      try {
        await fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: newAnswers }),
        });
      } catch {
        // best effort
      }
      router.push("/mypage?onboarded=true");
    } else {
      setStep((s) => s + 1);
      setCurrentText("");
      setSelectedOptions([]);
    }
  };

  const handlePrev = () => {
    if (step === 0) return;
    const prevQ = ONBOARDING_QUESTIONS[step - 1];
    const prevAnswer = answers[prevQ.id];
    if (prevQ.type === "text") setCurrentText((prevAnswer as string) ?? "");
    else setSelectedOptions((prevAnswer as string[]) ?? []);
    setStep((s) => s - 1);
  };

  const toggleOption = (opt: string) => {
    if (question.type === "choice") {
      setSelectedOptions([opt]);
    } else {
      setSelectedOptions((prev) =>
        prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
      );
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex", flexDirection: "column",
    }}>
      {/* Progress Bar */}
      <div style={{ height: 3, background: "var(--line-soft)" }}>
        <div style={{
          height: "100%", background: "var(--accent)",
          width: `${progress}%`, transition: "width 0.4s ease",
        }} />
      </div>

      {/* Header */}
      <div style={{ padding: "24px clamp(20px, 4vw, 48px)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: '"EB Garamond", Georgia, serif', fontStyle: "italic", fontSize: 20, color: "var(--accent)" }}>
          ?!
        </div>
        <div style={{ fontSize: 13, color: "var(--muted)" }}>
          {step + 1} / {ONBOARDING_QUESTIONS.length}
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "40px clamp(20px, 4vw, 48px)",
      }}>
        <div style={{ maxWidth: 560, width: "100%" }}>
          <div style={{
            fontSize: 11.5, letterSpacing: "0.28em", textTransform: "uppercase",
            color: "var(--muted)", fontFamily: '"EB Garamond", Georgia, serif', fontStyle: "italic",
            marginBottom: 24,
          }}>
            Question {String(step + 1).padStart(2, "0")}
          </div>

          <h1 style={{
            fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
            fontSize: "clamp(24px, 4vw, 36px)",
            fontWeight: 400, lineHeight: 1.4, letterSpacing: "-0.01em",
            color: "var(--ink)", marginBottom: 12,
          }}>
            {question.question}
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.65, marginBottom: 40 }}>
            — {question.hint}
          </p>

          {/* Input Area */}
          {question.type === "text" && (
            <textarea
              value={currentText}
              onChange={(e) => setCurrentText(e.target.value)}
              placeholder="자유롭게 적어주세요..."
              rows={4}
              autoFocus
              style={{
                width: "100%", background: "rgba(255,255,255,0.6)",
                border: "1px solid var(--line)", borderRadius: 14,
                padding: "18px 20px", fontSize: 16, color: "var(--ink)",
                lineHeight: 1.7, resize: "none", outline: "none",
                fontFamily: "var(--font-noto-sans-kr), sans-serif",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = "var(--accent)"; }}
              onBlur={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = "var(--line)"; }}
            />
          )}

          {(question.type === "choice" || question.type === "multi") && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(question.options ?? []).map((opt) => {
                const isSelected = selectedOptions.includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => toggleOption(opt)}
                    style={{
                      padding: "16px 20px",
                      borderRadius: 12, textAlign: "left",
                      fontSize: 15, color: isSelected ? "var(--accent)" : "var(--ink-soft)",
                      background: isSelected ? "rgba(94,70,50,0.06)" : "rgba(255,255,255,0.5)",
                      border: `1.5px solid ${isSelected ? "var(--accent)" : "var(--line-soft)"}`,
                      cursor: "pointer", transition: "all 0.2s",
                      fontFamily: "var(--font-noto-sans-kr), sans-serif",
                      fontWeight: isSelected ? 500 : 400,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                        (e.currentTarget as HTMLElement).style.color = "var(--ink)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLElement).style.borderColor = "var(--line-soft)";
                        (e.currentTarget as HTMLElement).style.color = "var(--ink-soft)";
                      }
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
              {question.type === "multi" && (
                <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                  여러 개 선택 가능합니다 ({selectedOptions.length}개 선택됨)
                </p>
              )}
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: "flex", gap: 12, marginTop: 40, justifyContent: "space-between", alignItems: "center" }}>
            {step > 0 ? (
              <button
                onClick={handlePrev}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontSize: 14, color: "var(--muted)", background: "none",
                  border: "none", cursor: "pointer", padding: "10px 0",
                }}
              >
                <ChevronLeft size={16} /> 이전
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "14px 28px", borderRadius: 9999,
                background: canProceed() ? "var(--ink)" : "var(--line-soft)",
                color: canProceed() ? "var(--cream-on-dark)" : "var(--muted)",
                fontSize: 15, fontWeight: 500,
                border: "none", cursor: canProceed() ? "pointer" : "not-allowed",
                transition: "all 0.2s",
              }}
            >
              {isSubmitting ? "저장 중…" : isLast ? "완료" : "다음"}
              {!isLast && !isSubmitting && <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
