"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Send, Pencil, Trash2, Check, X } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { isAdminEmail } from "@/lib/admin";
import { updateLandingQuestionAction, deleteLandingQuestionAction } from "@/lib/actions/landing-questions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Props {
  question: any;
  answers: any[];
}

export function LandingQuestionView({ question, answers: initialAnswers }: Props) {
  const [answers, setAnswers] = useState(initialAnswers);
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  // 관리자 기능
  const currentUser = useAppStore((s) => s.currentUser);
  const isAdmin = isAdminEmail(currentUser?.email);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(question.content ?? "");
  const [displayContent, setDisplayContent] = useState(question.content ?? "");
  const router = useRouter();

  const handleSaveEdit = async () => {
    if (!editContent.trim() || editContent.trim().length < 5) { toast.error("5자 이상 입력해주세요."); return; }
    const result = await updateLandingQuestionAction(question.id, editContent.trim());
    if (result.error) { toast.error(result.error as string); return; }
    setDisplayContent(editContent.trim());
    setIsEditing(false);
    toast.success("수정됐어요.");
  };

  const handleDelete = async () => {
    if (!confirm("이 질문을 삭제할까요? 모든 답변도 함께 삭제됩니다.")) return;
    const result = await deleteLandingQuestionAction(question.id);
    if (result.error) { toast.error(result.error as string); return; }
    toast.success("삭제됐어요.");
    router.push("/questions");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content.trim().length < 2) return;
    setStatus("sending");
    try {
      const res = await fetch(`/api/landing-questions/${question.id}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          author_name: authorName.trim() || "익명",
          question_content: question.content, // 정적 질문 자동 생성용
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAnswers((prev) => [data.answer, ...prev]);
      setContent("");
      setAuthorName("");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
    setTimeout(() => setStatus("idle"), 2000);
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "clamp(16px, 3vw, 32px) clamp(16px, 4vw, 48px) clamp(40px, 6vw, 80px)" }}>
      <Link href="/questions" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--muted)", textDecoration: "none", marginBottom: "clamp(16px, 3vw, 32px)" }}>
        <ArrowLeft size={14} /> 질문으로 돌아가기
      </Link>

      {/* 질문 카드 */}
      <div style={{
        padding: "clamp(18px, 3.5vw, 32px) clamp(16px, 3.5vw, 36px)", borderRadius: 16,
        background: "var(--ink)", color: "var(--cream-on-dark)",
        marginBottom: "clamp(20px, 3vw, 36px)", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 60% 60% at 90% 10%, rgba(176,138,74,0.15), transparent 60%)",
        }} />
        {/* 헤더 행: 라벨 + 관리자 버튼 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, position: "relative" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
            Today&rsquo;s Question
          </div>
          {isAdmin && !isEditing && (
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => { setIsEditing(true); setEditContent(displayContent); }} title="수정"
                style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 7, padding: "5px 10px", cursor: "pointer", color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
                <Pencil size={11} /> 수정
              </button>
              <button onClick={handleDelete} title="삭제"
                style={{ background: "rgba(239,68,68,0.18)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 7, padding: "5px 10px", cursor: "pointer", color: "rgba(255,120,120,0.95)", display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
                <Trash2 size={11} /> 삭제
              </button>
            </div>
          )}
        </div>

        {isAdmin && isEditing ? (
          <div style={{ position: "relative" }}>
            <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={3} autoFocus
              style={{ width: "100%", padding: "12px 14px", borderRadius: 8, fontSize: "clamp(15px, 2.5vw, 22px)", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.3)", color: "var(--cream-on-dark)", outline: "none", resize: "vertical", fontFamily: "var(--font-noto-serif-kr), Georgia, serif", lineHeight: 1.55, boxSizing: "border-box", marginBottom: 10 }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleSaveEdit} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 8, fontSize: 13, background: "rgba(255,255,255,0.18)", color: "white", border: "1px solid rgba(255,255,255,0.3)", cursor: "pointer" }}>
                <Check size={12} /> 저장
              </button>
              <button onClick={() => setIsEditing(false)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 8, fontSize: 13, background: "none", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer" }}>
                <X size={12} /> 취소
              </button>
            </div>
          </div>
        ) : (
          <p style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: "clamp(16px, 3vw, 24px)", fontWeight: 300, lineHeight: 1.55, letterSpacing: "-0.01em", position: "relative" }}>
            {displayContent}
          </p>
        )}
        <div style={{ display: "flex", gap: 20, marginTop: 24, fontSize: 13, color: "rgba(255,255,255,0.4)", position: "relative" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <MessageSquare size={13} /> {answers.length} 답변
          </span>
          <span>— {question.author_name}</span>
        </div>

        {/* 연결된 북클럽 모임 — 운영자가 지정한 경우에만 노출 */}
        {question.linked_slug && question.linked_label && (
          <Link
            href={`/bookclub/${question.linked_slug}`}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6, marginTop: 20,
              fontSize: 13.5, color: "rgba(255,255,255,0.75)", textDecoration: "none",
              position: "relative", borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 16, width: "100%",
            }}
          >
            {question.linked_label}
          </Link>
        )}
      </div>

      {/* 답변 입력 */}
      <div style={{ marginBottom: "clamp(24px, 4vw, 48px)" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 16 }}>
          답변 남기기
        </div>
        {status === "sent" ? (
          <div style={{ padding: "20px 24px", borderRadius: 12, background: "rgba(255,255,255,0.5)", border: "1px solid var(--line-soft)", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 15, color: "var(--ink)" }}>
              답변이 전달됐어요.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="이 질문에 대한 당신의 생각을 적어주세요."
              rows={4}
              style={{
                width: "100%", padding: "16px 18px", borderRadius: 12, fontSize: 15,
                border: "1px solid var(--line-soft)", background: "rgba(255,255,255,0.6)",
                color: "var(--ink)", outline: "none", resize: "vertical",
                lineHeight: 1.7, fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                boxSizing: "border-box", marginBottom: 10,
              }}
            />
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="닉네임 (익명도 괜찮아요)"
                maxLength={20}
                style={{
                  flex: 1, padding: "10px 14px", borderRadius: 9, fontSize: 13.5,
                  border: "1px solid var(--line-soft)", background: "rgba(255,255,255,0.6)",
                  color: "var(--ink)", outline: "none",
                  fontFamily: "var(--font-noto-sans-kr), sans-serif",
                }}
              />
              <button
                type="submit"
                disabled={content.trim().length < 2 || status === "sending"}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "10px 22px", borderRadius: 9999, fontSize: 14,
                  background: content.trim().length >= 2 ? "var(--ink)" : "var(--line-soft)",
                  color: content.trim().length >= 2 ? "var(--cream-on-dark)" : "var(--muted)",
                  border: "none", cursor: content.trim().length >= 2 ? "pointer" : "not-allowed",
                  transition: "all .2s",
                }}
              >
                <Send size={13} />
                {status === "sending" ? "전송 중…" : "답변하기"}
              </button>
            </div>
            {status === "error" && (
              <p style={{ fontSize: 12.5, color: "#EF4444", marginTop: 8 }}>잠시 후 다시 눌러주세요.</p>
            )}
          </form>
        )}
      </div>

      {/* 답변 목록 */}
      {answers.length > 0 && (
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 24 }}>
            {answers.length}개의 답변
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {answers.map((a: any, i) => (
              <div key={a.id ?? i} style={{
                padding: "22px 0",
                borderBottom: "1px solid var(--line-soft)",
                display: "grid", gridTemplateColumns: "80px 1fr auto", gap: 16, alignItems: "start",
              }}>
                <div>
                  <p style={{ fontFamily: '"EB Garamond", Georgia, serif', fontSize: 15, color: "var(--accent)", fontStyle: "normal" }}>
                    {a.author_name ?? "익명"}
                  </p>
                  {a.created_at && (
                    <p style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>{formatDate(a.created_at)}</p>
                  )}
                </div>
                <p style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 15.5, fontWeight: 300, lineHeight: 1.75, color: "var(--ink)", letterSpacing: "-0.005em" }}>
                  {a.content}
                </p>
                {/* 관리자 삭제 버튼 */}
                {isAdmin && a.id && (
                  <button
                    onClick={async () => {
                      if (!confirm("이 답변을 삭제할까요?")) return;
                      const res = await fetch(`/api/landing-questions/${question.id}/answers/${a.id}`, { method: "DELETE" });
                      if (res.ok) {
                        setAnswers((prev) => prev.filter((x: any) => x.id !== a.id));
                        toast.success("삭제됐어요.");
                      } else {
                        toast.error("삭제에 실패했어요.");
                      }
                    }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", padding: 4, display: "flex", alignItems: "center", marginTop: 2 }}
                    title="답변 삭제"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {answers.length === 0 && (
        <div style={{ textAlign: "center", padding: "clamp(24px, 5vw, 60px) 0", color: "var(--muted)", fontFamily: "var(--font-noto-serif-kr), Georgia, serif", lineHeight: 1.75 }}>
          아직 첫 답변이 없어요.<br />당신이 처음이 되어주세요.
        </div>
      )}
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
