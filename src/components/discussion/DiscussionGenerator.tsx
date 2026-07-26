"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Check, Smile, Meh, Frown, ChevronDown, RefreshCw, Pencil } from "lucide-react";
import "./discussion-generator.css";

interface DiscussionGeneratorProps {
  variant: "giants" | "landing";
}

type Mode = "book" | "free";
type Direction = "free" | "life" | "society" | "philosophy";
type Depth = "first" | "general" | "deep";
type Status = "idle" | "loading" | "done" | "error";
type Reaction = "up" | "neutral" | "down";

interface DiscussionQuestion {
  number: number;
  stage: "opening" | "deep" | "giant" | "closing";
  question: string;
  intent: string;
  followup: string;
  concept: string;
  thinker?: string;
}

interface GiantUsed {
  slug: string;
  name: string;
  stance: "support" | "critical";
  summary: string;
}

interface DiscussionResult {
  analysis: {
    confirmed_title: string;
    confirmed_author: string;
    confidence: "high" | "medium" | "low";
    core_argument: string;
    key_concepts: string[];
    tensions: string[];
    modern_connection: string;
  };
  giants: GiantUsed[];
  opening_lines: string[];
  tensions: string[];
  questions: DiscussionQuestion[];
  facilitator_notes: string;
}

const FEEDBACK_KEY = "qsp_discussion_feedback";
const SESSION_KEY = "qsp_session_key";
const HANDOFF_KEY = "qsp_discussion_handoff";

const DIRECTIONS: { value: Direction; label: string }[] = [
  { value: "free", label: "자유롭게" },
  { value: "life", label: "삶과 연결" },
  { value: "society", label: "사회와 연결" },
  { value: "philosophy", label: "철학적으로 깊게" },
];
const DEPTHS: { value: Depth; label: string }[] = [
  { value: "first", label: "처음 읽는 모임" },
  { value: "general", label: "일반 북클럽" },
  { value: "deep", label: "깊이 있는 토론" },
];

const STAGE_LABEL: Record<DiscussionQuestion["stage"], string> = {
  opening: "대화 시작", deep: "심화", giant: "거인의 시선", closing: "마무리",
};

function getSessionKey(): string {
  if (typeof window === "undefined") return "";
  let key = window.localStorage.getItem(SESSION_KEY);
  if (!key) {
    key = Math.random().toString(36).slice(2) + Date.now().toString(36);
    window.localStorage.setItem(SESSION_KEY, key);
  }
  return key;
}

export default function DiscussionGenerator({ variant }: DiscussionGeneratorProps) {
  const [mode, setMode] = useState<Mode>("book");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [freeInput, setFreeInput] = useState("");
  const [direction, setDirection] = useState<Direction>("free");
  const [depth, setDepth] = useState<Depth>("general");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<DiscussionResult | null>(null);
  const [discussionId, setDiscussionId] = useState<string | null>(null);

  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [reactionSubmitting, setReactionSubmitting] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [commentSent, setCommentSent] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const sessionKeyRef = useRef("");
  const reactionRef = useRef<Reaction | null>(null);

  useEffect(() => {
    sessionKeyRef.current = getSessionKey();
    setFeedbackGiven(window.localStorage.getItem(FEEDBACK_KEY) === "1");

    if (variant === "giants") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("handoff") === "1") {
        const raw = window.sessionStorage.getItem(HANDOFF_KEY);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            setMode(parsed.mode);
            setTitle(parsed.title ?? "");
            setAuthor(parsed.author ?? "");
            setDescription(parsed.description ?? "");
            setFreeInput(parsed.freeInput ?? "");
            setDirection(parsed.direction ?? "free");
            setDepth(parsed.depth ?? "general");
            setResult(parsed.result);
            setDiscussionId(parsed.discussionId ?? null);
            setStatus("done");
          } catch {
            // 손상된 핸드오프 데이터는 무시
          }
          window.sessionStorage.removeItem(HANDOFF_KEY);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inputValid = mode === "book" ? title.trim() && author.trim() : freeInput.trim();

  const runGenerate = async () => {
    if (!inputValid || status === "loading") return;
    setStatus("loading");
    setErrorMessage("");
    setCopiedAll(false);
    setCopiedIdx(null);
    setCommentOpen(false);
    setCommentSent(false);
    try {
      const res = await fetch("/api/discussion/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "book"
            ? { mode: "book", title: title.trim(), author: author.trim(), description: description.trim(), direction, depth }
            : { mode: "free", input: freeInput.trim(), direction, depth }
        ),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.result) {
        setErrorMessage(data.error || "발제를 만드는 중 문제가 생겼어요.");
        setStatus("error");
        return;
      }
      setResult(data.result);
      setDiscussionId(data.discussionId ?? null);
      setStatus("done");

      if (variant === "landing") {
        window.sessionStorage.setItem(
          HANDOFF_KEY,
          JSON.stringify({ mode, title, author, description, freeInput, direction, depth, result: data.result, discussionId: data.discussionId ?? null })
        );
      }
    } catch {
      setErrorMessage("네트워크 오류로 발제를 만들지 못했어요. 다시 시도해주세요.");
      setStatus("error");
    }
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    void runGenerate();
  };

  const handleEdit = () => {
    setStatus("idle");
    setResult(null);
  };

  const sendFeedback = async (reaction: Reaction, commentText?: string) => {
    try {
      await fetch("/api/discussion/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discussion_id: discussionId,
          session_key: sessionKeyRef.current,
          reaction,
          comment: commentText,
          input_text: mode === "book" ? `${title} / ${author}` : freeInput.trim(),
        }),
      });
    } catch {
      // 피드백 저장 실패는 사용자 경험을 막지 않음
    }
  };

  const handleReaction = (reaction: Reaction) => {
    if (reactionSubmitting || feedbackGiven) return;
    reactionRef.current = reaction;
    setReactionSubmitting(true);
    setFeedbackGiven(true);
    window.localStorage.setItem(FEEDBACK_KEY, "1");
    void sendFeedback(reaction);
    setReactionSubmitting(false);
  };

  const handleSendComment = () => {
    if (!comment.trim() || !reactionRef.current) return;
    void sendFeedback(reactionRef.current, comment.trim());
    setCommentSent(true);
  };

  const copyText = (text: string) => navigator.clipboard.writeText(text).catch(() => {});

  const allQuestionsText = () =>
    (result?.questions ?? []).map((q) => `${q.number}. [${STAGE_LABEL[q.stage]}] ${q.question}`).join("\n\n");

  const handleCopyAll = () => {
    copyText(allQuestionsText());
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopyOne = (idx: number, text: string) => {
    copyText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx((cur) => (cur === idx ? null : cur)), 2000);
  };

  const renderInputForm = () => (
    <form className="dg-form" onSubmit={handleGenerate}>
      {mode === "book" ? (
        <div className="dg-book-fields">
          <input
            className="dg-input dg-input--line"
            placeholder="책 제목 (필수)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
          />
          <input
            className="dg-input dg-input--line"
            placeholder="작가 (필수)"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            maxLength={60}
          />
          <textarea
            className="dg-input"
            placeholder="책 설명 (선택 — 있으면 발제 정확도가 올라가요)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={800}
            rows={2}
          />
        </div>
      ) : (
        <textarea
          className="dg-input"
          placeholder="책 제목이나 마음에 걸리는 문장을 적어주세요"
          value={freeInput}
          onChange={(e) => setFreeInput(e.target.value)}
          maxLength={300}
          rows={2}
        />
      )}

      <button type="button" className="dg-mode-toggle" onClick={() => setMode(mode === "book" ? "free" : "book")}>
        {mode === "book" ? "문장으로 입력할래요" : "책 정보로 입력할래요"}
      </button>

      <button type="button" className="dg-settings-toggle" onClick={() => setSettingsOpen((v) => !v)} aria-expanded={settingsOpen}>
        <span>세부 설정</span>
        <ChevronDown size={13} style={{ transform: settingsOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>

      {settingsOpen && (
        <div className="dg-settings-panel">
          <div className="dg-settings-group">
            <span className="dg-settings-label">발제 방향</span>
            <div className="dg-settings-options">
              {DIRECTIONS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  className={`dg-chip ${direction === d.value ? "dg-chip--active" : ""}`}
                  onClick={() => setDirection(d.value)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          <div className="dg-settings-group">
            <span className="dg-settings-label">모임 깊이</span>
            <div className="dg-settings-options">
              {DEPTHS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  className={`dg-chip ${depth === d.value ? "dg-chip--active" : ""}`}
                  onClick={() => setDepth(d.value)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <button type="submit" className="dg-btn" disabled={!inputValid || status === "loading"}>
        {status === "loading" ? (
          <>
            <span className="dg-spin" />
            발제 만드는 중…
          </>
        ) : (
          "지적인 발제 만들기"
        )}
      </button>

      {status === "error" && <p className="dg-error">{errorMessage}</p>}
    </form>
  );

  const renderQuestionItem = (q: DiscussionQuestion, idx: number, showMeta: boolean) => (
    <li key={q.number} className="dg-topic">
      <span className="dg-topic-num">{String(q.number).padStart(2, "0")}</span>
      <div className="dg-topic-body">
        {showMeta && <span className="dg-topic-stage">{STAGE_LABEL[q.stage]}{q.thinker ? ` · ${q.thinker}` : ""}</span>}
        <span className="dg-topic-text">{q.question}</span>
        {showMeta && q.followup && <span className="dg-topic-followup">↳ {q.followup}</span>}
      </div>
      {feedbackGiven && (
        <button type="button" className="dg-copy-icon" onClick={() => handleCopyOne(idx, q.question)} title="이 질문 복사">
          {copiedIdx === idx ? <Check size={14} /> : <Copy size={14} />}
        </button>
      )}
    </li>
  );

  const renderFeedbackBar = () => (
    <div className="dg-feedback-bar">
      {!feedbackGiven ? (
        <>
          <span className="dg-feedback-label">이 발제, 어땠나요?</span>
          <div className="dg-feedback-btns">
            <button type="button" onClick={() => handleReaction("up")} title="좋아요"><Smile size={18} /></button>
            <button type="button" onClick={() => handleReaction("neutral")} title="보통이에요"><Meh size={18} /></button>
            <button type="button" onClick={() => handleReaction("down")} title="아쉬워요"><Frown size={18} /></button>
          </div>
        </>
      ) : (
        <div className="dg-after-feedback">
          <button type="button" className="dg-copy-all" onClick={handleCopyAll}>
            {copiedAll ? <Check size={14} /> : <Copy size={14} />}
            {copiedAll ? "복사됨" : "전체 복사"}
          </button>
          <button type="button" className="dg-copy-all" onClick={() => void runGenerate()}>
            <RefreshCw size={14} /> 재생성
          </button>
          <button type="button" className="dg-copy-all" onClick={handleEdit}>
            <Pencil size={14} /> 수정
          </button>
          {!commentSent ? (
            commentOpen ? (
              <div className="dg-comment-row">
                <input
                  className="dg-comment-input"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="한 줄로 더 남겨주세요 (선택)"
                  maxLength={200}
                />
                <button type="button" className="dg-comment-send" onClick={handleSendComment} disabled={!comment.trim()}>보내기</button>
              </div>
            ) : (
              <button type="button" className="dg-comment-open" onClick={() => setCommentOpen(true)}>한 줄로 더 남기기</button>
            )
          ) : (
            <span className="dg-comment-thanks">고마워요</span>
          )}
        </div>
      )}
    </div>
  );

  if (status === "done" && result) {
    if (variant === "landing") {
      const preview = result.questions.slice(0, 3);
      return (
        <div className={`dg dg--${variant}`}>
          <div className="dg-book-tag">「{result.analysis.confirmed_title}」 · {result.analysis.confirmed_author}</div>
          <ol className="dg-topics">
            {preview.map((q, idx) => renderQuestionItem(q, idx, false))}
          </ol>
          <a
            className="dg-btn dg-btn--link"
            href="/giants?handoff=1"
          >
            발제 10개 전체 보기 →
          </a>
        </div>
      );
    }

    return (
      <div className={`dg dg--${variant}`}>
        <div className="dg-result-book">
          <div className="dg-book-tag">「{result.analysis.confirmed_title}」 · {result.analysis.confirmed_author}</div>
          {result.analysis.confidence === "low" && (
            <p className="dg-confidence-note">이 책에 대한 확신이 낮아요 — 책 설명을 더해 다시 만들면 정확도가 올라가요.</p>
          )}
        </div>

        {result.opening_lines.length > 0 && (
          <div className="dg-section">
            <span className="dg-section-label">오프닝</span>
            {result.opening_lines.map((line, i) => <p key={i} className="dg-opening-line">{line}</p>)}
          </div>
        )}

        {result.tensions.length > 0 && (
          <div className="dg-section">
            <span className="dg-section-label">핵심 긴장</span>
            <ul className="dg-tension-list">
              {result.tensions.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </div>
        )}

        {result.giants.length > 0 && (
          <div className="dg-giants-used">
            {result.giants.map((g) => (
              <span key={g.slug} className={`dg-giant-chip dg-giant-chip--${g.stance}`}>
                {g.name} · {g.stance === "support" ? "지지 관점" : "비판 관점"}
              </span>
            ))}
          </div>
        )}

        <ol className="dg-topics">
          {result.questions.map((q, idx) => renderQuestionItem(q, idx, true))}
        </ol>

        {result.facilitator_notes && (
          <p className="dg-facilitator-note">진행자 메모: {result.facilitator_notes}</p>
        )}

        {renderFeedbackBar()}
      </div>
    );
  }

  return (
    <div className={`dg dg--${variant}`}>
      {renderInputForm()}
    </div>
  );
}
