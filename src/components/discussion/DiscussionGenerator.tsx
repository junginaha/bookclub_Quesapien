"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Check, Smile, Meh, Frown } from "lucide-react";
import "./discussion-generator.css";

interface DiscussionGeneratorProps {
  variant: "giants" | "landing";
}

type Status = "idle" | "loading" | "done" | "error";
type Reaction = "up" | "neutral" | "down";

const FEEDBACK_KEY = "qsp_discussion_feedback";
const SESSION_KEY = "qsp_session_key";

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
  const [input, setInput] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [discussionId, setDiscussionId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
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
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status === "loading") return;
    setStatus("loading");
    setCopiedAll(false);
    setCopiedIdx(null);
    setCommentOpen(false);
    setCommentSent(false);
    try {
      const res = await fetch("/api/discussion/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: input.trim() }),
      });
      if (!res.ok) throw new Error("fail");
      const data = await res.json();
      if (!Array.isArray(data.topics) || data.topics.length === 0) throw new Error("empty");
      setTopics(data.topics);
      setDiscussionId(data.discussionId ?? null);
      setStatus("done");
    } catch {
      setStatus("error");
    }
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
          input_text: input.trim(),
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

  const handleCopyAll = () => {
    copyText(topics.map((t, i) => `${i + 1}. ${t}`).join("\n\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopyOne = (idx: number) => {
    copyText(topics[idx]);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx((cur) => (cur === idx ? null : cur)), 2000);
  };

  return (
    <div className={`dg dg--${variant}`}>
      <form className="dg-form" onSubmit={handleGenerate}>
        <textarea
          className="dg-input"
          placeholder="책 제목이나 마음에 걸리는 문장을 적어주세요"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={300}
          rows={2}
        />
        <button
          type="submit"
          className="dg-btn"
          disabled={!input.trim() || status === "loading"}
        >
          {status === "loading" ? (
            <>
              <span className="dg-spin" />
              발제 만드는 중…
            </>
          ) : (
            "발제 10개 생성하기"
          )}
        </button>
        {status === "error" && (
          <p className="dg-error">발제를 만드는 중 문제가 생겼어요. 다시 시도해주세요.</p>
        )}
      </form>

      {status === "done" && topics.length > 0 && (
        <>
          <ol className="dg-topics">
            {topics.map((topic, idx) => (
              <li key={idx} className="dg-topic">
                <span className="dg-topic-num">{String(idx + 1).padStart(2, "0")}</span>
                <span className="dg-topic-text">{topic}</span>
                {feedbackGiven && (
                  <button
                    type="button"
                    className="dg-copy-icon"
                    onClick={() => handleCopyOne(idx)}
                    title="이 질문 복사"
                  >
                    {copiedIdx === idx ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                )}
              </li>
            ))}
          </ol>

          <div className="dg-feedback-bar">
            {!feedbackGiven ? (
              <>
                <span className="dg-feedback-label">이 발제, 어땠나요?</span>
                <div className="dg-feedback-btns">
                  <button type="button" onClick={() => handleReaction("up")} title="좋아요">
                    <Smile size={18} />
                  </button>
                  <button type="button" onClick={() => handleReaction("neutral")} title="보통이에요">
                    <Meh size={18} />
                  </button>
                  <button type="button" onClick={() => handleReaction("down")} title="아쉬워요">
                    <Frown size={18} />
                  </button>
                </div>
              </>
            ) : (
              <div className="dg-after-feedback">
                <button type="button" className="dg-copy-all" onClick={handleCopyAll}>
                  {copiedAll ? <Check size={14} /> : <Copy size={14} />}
                  {copiedAll ? "복사됨" : "전체 복사"}
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
                      <button type="button" className="dg-comment-send" onClick={handleSendComment} disabled={!comment.trim()}>
                        보내기
                      </button>
                    </div>
                  ) : (
                    <button type="button" className="dg-comment-open" onClick={() => setCommentOpen(true)}>
                      한 줄로 더 남기기
                    </button>
                  )
                ) : (
                  <span className="dg-comment-thanks">고마워요</span>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
