"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Users, MessageSquare, BookOpen, Calendar,
  Trash2, Star, StarOff, CheckCircle, XCircle,
  ArrowLeft, RefreshCw, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = any;
/* eslint-enable @typescript-eslint/no-explicit-any */

type Tab = "overview" | "users" | "questions" | "sessions" | "reviews" | "applications" | "landing_questions" | "all_landing";

interface Props {
  profiles: Row[];
  questions: Row[];
  sessions: Row[];
  reviews: Row[];
  applications?: Row[];
  landingQuestions?: Row[];
  allLandingQuestions?: Row[];
  adminEmail: string;
}

export default function AdminClient({
  profiles, questions, sessions, reviews,
  applications = [], landingQuestions = [],
  allLandingQuestions = [], adminEmail,
}: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [pending, startTransition] = useTransition();
  // 전체 질문 로컬 상태 (즉시 반영)
  const [localAll, setLocalAll] = useState<Row[]>(allLandingQuestions);
  const [editingLQ, setEditingLQ] = useState<string | null>(null);
  const [editLQContent, setEditLQContent] = useState("");
  const [lqFilter, setLqFilter] = useState<"all" | "approved" | "pending">("all");

  const filteredLQ = localAll.filter((q) => {
    if (lqFilter === "approved") return q.is_approved;
    if (lqFilter === "pending") return !q.is_approved;
    return true;
  });

  const stats = [
    { label: "가입자", value: profiles.length, icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "발제 질문", value: questions.length, icon: BookOpen, color: "bg-amber-50 text-amber-600" },
    { label: "모임", value: sessions.length, icon: Calendar, color: "bg-emerald-50 text-emerald-600" },
    { label: "후기", value: reviews.length, icon: MessageSquare, color: "bg-purple-50 text-purple-600" },
    { label: "북클럽 신청", value: applications.length, icon: CheckCircle, color: "bg-emerald-50 text-emerald-600" },
    { label: "전체 질문", value: allLandingQuestions.length, icon: Star, color: "bg-orange-50 text-orange-600" },
  ];

  const callAdmin = async (action: string, id: string, extra?: Record<string, unknown>) => {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, id, ...extra }),
    });
    const data = await res.json() as { error?: string; ok?: boolean };
    if (data.error) { toast.error(data.error); return false; }
    toast.success("처리되었습니다.");
    return true;
  };

  const handle = (fn: () => Promise<boolean>) => {
    startTransition(async () => {
      const ok = await fn();
      if (ok) router.refresh();
    });
  };

  const TABS: { key: Tab; label: string; badge?: number }[] = [
    { key: "overview", label: "대시보드" },
    { key: "all_landing", label: `질문 전체 (${allLandingQuestions.length})` },
    { key: "landing_questions", label: "미승인 질문", badge: landingQuestions.length },
    { key: "users", label: `가입자 (${profiles.length})` },
    { key: "questions", label: `발제질문 (${questions.length})` },
    { key: "sessions", label: `모임 (${sessions.length})` },
    { key: "reviews", label: `후기 (${reviews.length})` },
    { key: "applications", label: "북클럽 신청", badge: applications.filter((a) => a.status === "pending").length },
  ];

  return (
    <div className="min-h-screen bg-warm-50">
      {/* Header */}
      <header className="bg-warm-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-warm-300" />
          <span className="font-serif font-bold text-lg">관리자 대시보드</span>
          <span className="text-xs text-warm-400">— 질문하는 사람들</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-warm-400">{adminEmail}</span>
          <Link href="/">
            <Button size="sm" variant="outline" className="gap-1.5 border-warm-700 text-warm-300 hover:bg-warm-800 hover:text-white hover:border-warm-600">
              <ArrowLeft className="h-3.5 w-3.5" />사이트로
            </Button>
          </Link>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-warm-100 px-6">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === t.key
                  ? "border-warm-900 text-warm-900"
                  : "border-transparent text-warm-400 hover:text-warm-700"
              }`}>
              {t.label}
              {t.badge != null && t.badge > 0 && (
                <span className="min-w-4 h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] px-1">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="bg-white rounded-2xl border border-warm-100 p-5 flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.color}`}>
                    <s.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-warm-900 font-serif">{s.value}</p>
                    <p className="text-xs text-warm-400">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 최근 가입자 */}
            <div className="bg-white rounded-2xl border border-warm-100 p-5">
              <h3 className="font-semibold text-warm-900 mb-4 flex items-center gap-2">
                <Users className="h-4 w-4" />최근 가입자
              </h3>
              <div className="flex flex-col gap-2">
                {profiles.slice(0, 5).map((p: Row) => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-warm-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-warm-900">{p.name}</p>
                      <p className="text-xs text-warm-400">{p.email}</p>
                    </div>
                    <span className="text-xs text-warm-400">{formatDate(p.joined_at)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 최근 질문 */}
            <div className="bg-white rounded-2xl border border-warm-100 p-5">
              <h3 className="font-semibold text-warm-900 mb-4 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />최근 발제
              </h3>
              <div className="flex flex-col gap-2">
                {questions.slice(0, 5).map((q: Row) => (
                  <div key={q.id} className="flex items-center justify-between py-2 border-b border-warm-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-warm-900 truncate">{q.title}</p>
                      <p className="text-xs text-warm-400">{q.author?.name} · {q.category}</p>
                    </div>
                    {q.is_featured && <Badge variant="secondary" className="text-xs shrink-0 ml-2">Featured</Badge>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === "users" && (
          <div className="bg-white rounded-2xl border border-warm-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-warm-50 border-b border-warm-100">
                <tr>
                  {["이름", "이메일", "가입일", "참여 횟수", "관리"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-warm-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-50">
                {profiles.map((p: Row) => (
                  <tr key={p.id} className="hover:bg-warm-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-warm-900">{p.name}</td>
                    <td className="px-4 py-3 text-warm-500">{p.email}</td>
                    <td className="px-4 py-3 text-warm-400">{formatDate(p.joined_at)}</td>
                    <td className="px-4 py-3 text-warm-600">{p.session_count}회</td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="outline"
                        className="text-red-500 border-red-200 hover:bg-red-50 gap-1 h-7 text-xs"
                        disabled={pending}
                        onClick={() => handle(() => callAdmin("delete_user", p.id))}>
                        <Trash2 className="h-3 w-3" />삭제
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {profiles.length === 0 && <p className="text-center py-12 text-warm-400 text-sm">가입자가 없습니다.</p>}
          </div>
        )}

        {/* QUESTIONS */}
        {tab === "questions" && (
          <div className="bg-white rounded-2xl border border-warm-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-warm-50 border-b border-warm-100">
                <tr>
                  {["발제문", "작성자", "카테고리", "모임", "상태", "관리"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-warm-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-50">
                {questions.map((q: Row) => (
                  <tr key={q.id} className="hover:bg-warm-50 transition-colors">
                    <td className="px-4 py-3 max-w-xs">
                      <Link href={`/questions/${q.id}`} className="font-medium text-warm-900 hover:text-warm-600 line-clamp-2">
                        {q.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-warm-500">{q.author?.name}</td>
                    <td className="px-4 py-3"><Badge variant="secondary" className="text-xs">{q.category}</Badge></td>
                    <td className="px-4 py-3 text-warm-600">{q.session_count}회</td>
                    <td className="px-4 py-3">
                      {q.is_featured
                        ? <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200">Featured</Badge>
                        : <span className="text-xs text-warm-400">일반</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="outline" disabled={pending}
                          className="gap-1 h-7 text-xs"
                          onClick={() => handle(() => callAdmin("toggle_featured", q.id, { current: q.is_featured }))}>
                          {q.is_featured ? <StarOff className="h-3 w-3" /> : <Star className="h-3 w-3" />}
                          {q.is_featured ? "해제" : "Featured"}
                        </Button>
                        <Button size="sm" variant="outline" disabled={pending}
                          className="text-red-500 border-red-200 hover:bg-red-50 gap-1 h-7 text-xs"
                          onClick={() => handle(() => callAdmin("delete_question", q.id))}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {questions.length === 0 && <p className="text-center py-12 text-warm-400 text-sm">발제 질문이 없습니다.</p>}
          </div>
        )}

        {/* SESSIONS */}
        {tab === "sessions" && (
          <div className="bg-white rounded-2xl border border-warm-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-warm-50 border-b border-warm-100">
                <tr>
                  {["발제", "진행자", "날짜", "장소", "참여", "상태", "관리"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-warm-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-50">
                {sessions.map((s: Row) => (
                  <tr key={s.id} className="hover:bg-warm-50 transition-colors">
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-warm-900 line-clamp-1 text-xs">{s.question?.title}</p>
                    </td>
                    <td className="px-4 py-3 text-warm-500">{s.host?.name}</td>
                    <td className="px-4 py-3 text-warm-500">{s.date}</td>
                    <td className="px-4 py-3 text-warm-500 max-w-[120px] truncate">{s.location}</td>
                    <td className="px-4 py-3 text-warm-600">{s.current_participants}/{s.max_participants}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        s.status === "live" ? "bg-red-100 text-red-600" :
                        s.status === "upcoming" ? "bg-emerald-100 text-emerald-700" :
                        "bg-warm-100 text-warm-500"
                      }`}>
                        {s.status === "live" ? "진행 중" : s.status === "upcoming" ? "예정" : "종료"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {s.status !== "live" && (
                          <Button size="sm" variant="outline" disabled={pending}
                            className="gap-1 h-7 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                            onClick={() => handle(() => callAdmin("set_session_status", s.id, { status: "live" }))}>
                            <CheckCircle className="h-3 w-3" />Live
                          </Button>
                        )}
                        {s.status !== "closed" && (
                          <Button size="sm" variant="outline" disabled={pending}
                            className="gap-1 h-7 text-xs text-warm-500 border-warm-200 hover:bg-warm-50"
                            onClick={() => handle(() => callAdmin("set_session_status", s.id, { status: "closed" }))}>
                            <XCircle className="h-3 w-3" />종료
                          </Button>
                        )}
                        <Button size="sm" variant="outline" disabled={pending}
                          className="text-red-500 border-red-200 hover:bg-red-50 gap-1 h-7 text-xs"
                          onClick={() => handle(() => callAdmin("delete_session", s.id))}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sessions.length === 0 && <p className="text-center py-12 text-warm-400 text-sm">모임이 없습니다.</p>}
          </div>
        )}

        {/* REVIEWS */}
        {tab === "reviews" && (
          <div className="bg-white rounded-2xl border border-warm-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-warm-50 border-b border-warm-100">
                <tr>
                  {["작성자", "내용", "유형", "공감", "작성일", "관리"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-warm-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-50">
                {reviews.map((r: Row) => (
                  <tr key={r.id} className="hover:bg-warm-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-warm-900">{r.author?.name}</td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-warm-500 line-clamp-2 text-xs">{r.content}</p>
                    </td>
                    <td className="px-4 py-3"><Badge variant="secondary" className="text-xs">{r.type}</Badge></td>
                    <td className="px-4 py-3 text-warm-600">♥ {r.likes}</td>
                    <td className="px-4 py-3 text-warm-400">{formatDate(r.created_at)}</td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="outline" disabled={pending}
                        className="text-red-500 border-red-200 hover:bg-red-50 gap-1 h-7 text-xs"
                        onClick={() => handle(() => callAdmin("delete_review", r.id))}>
                        <Trash2 className="h-3 w-3" />삭제
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reviews.length === 0 && <p className="text-center py-12 text-warm-400 text-sm">후기가 없습니다.</p>}
          </div>
        )}

        {/* ── 북클럽 신청 탭 ── */}
        {tab === "applications" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg font-semibold text-warm-900">북클럽 신청 ({applications.length})</h2>
              <span className="text-xs text-warm-400">pending: {applications.filter((a) => a.status === "pending").length}건</span>
            </div>
            {applications.length === 0 ? (
              <p className="text-center py-12 text-warm-400 text-sm">신청이 없습니다.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-warm-100">
                <table className="w-full text-sm">
                  <thead className="bg-warm-50 border-b border-warm-100">
                    <tr>
                      {["신청일", "북클럽", "이름", "이메일", "메시지", "상태"].map((h) => (
                        <th key={h} className="text-left py-3 px-4 text-warm-500 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-warm-50">
                    {applications.map((a) => (
                      <tr key={a.id} className="hover:bg-warm-50 transition-colors">
                        <td className="py-3 px-4 text-warm-400 whitespace-nowrap">{formatDate(a.created_at)}</td>
                        <td className="py-3 px-4 font-medium text-warm-900">{a.club_slug}</td>
                        <td className="py-3 px-4 text-warm-700">{a.applicant_name}</td>
                        <td className="py-3 px-4 text-warm-500">{a.applicant_email}</td>
                        <td className="py-3 px-4 text-warm-400 max-w-xs truncate">{a.message ?? "—"}</td>
                        <td className="py-3 px-4">
                          <Badge variant={a.status === "pending" ? "secondary" : "default"} className="text-xs">
                            {a.status === "pending" ? "대기" : a.status === "confirmed" ? "확정" : "거절"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── 전체 랜딩 질문 관리 탭 ── */}
        {tab === "all_landing" && (
          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="font-serif text-lg font-semibold text-warm-900">질문 전체 관리 ({filteredLQ.length})</h2>
              <div className="flex gap-1">
                {(["all","approved","pending"] as const).map((f) => (
                  <button key={f} onClick={() => setLqFilter(f)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${lqFilter===f?"bg-warm-900 text-white":"bg-warm-100 text-warm-500 hover:bg-warm-200"}`}>
                    {f==="all"?"전체":f==="approved"?"승인됨":"미승인"}
                  </button>
                ))}
              </div>
            </div>
            {filteredLQ.length === 0 ? (
              <p className="text-center py-12 text-warm-400 text-sm">질문이 없습니다.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {filteredLQ.map((q) => (
                  <div key={q.id} className="rounded-xl border border-warm-100 bg-white overflow-hidden">
                    <div className="p-4">
                      {editingLQ === q.id ? (
                        <div className="flex flex-col gap-2">
                          <textarea
                            value={editLQContent}
                            onChange={(e) => setEditLQContent(e.target.value)}
                            rows={3}
                            className="w-full border border-warm-200 rounded-lg p-3 text-sm text-warm-900 resize-none outline-none focus:border-warm-400"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button size="sm" className="gap-1 bg-warm-900 text-white"
                              onClick={async () => {
                                const ok = await callAdmin("update_landing_question", q.id, { content: editLQContent });
                                if (ok) {
                                  setLocalAll((prev) => prev.map((x) => x.id === q.id ? { ...x, content: editLQContent } : x));
                                  setEditingLQ(null);
                                }
                              }}>
                              <CheckCircle className="h-3 w-3" /> 저장
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingLQ(null)}>취소</Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-warm-900 leading-relaxed">{q.content}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-warm-400 flex-wrap">
                        <span>— {q.author_name}</span>
                        <span>{formatDate(q.created_at)}</span>
                        {q.is_today && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full">Today</span>}
                        {q.is_featured && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">인기</span>}
                        {q.is_approved ? <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">승인</span>
                          : <span className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full">미승인</span>}
                        <span className="ml-auto">♡ {q.likes} · 답변 {q.answers_count}</span>
                      </div>
                    </div>
                    <div className="px-4 pb-3 flex flex-wrap gap-1.5 border-t border-warm-50 pt-3">
                      {/* 수정 */}
                      <Button size="sm" variant="outline" className="gap-1 h-7 text-xs"
                        onClick={() => { setEditingLQ(q.id); setEditLQContent(q.content); }}>
                        ✏️ 수정
                      </Button>
                      {/* 승인 토글 */}
                      <Button size="sm" variant="outline"
                        className={`gap-1 h-7 text-xs ${q.is_approved ? "text-emerald-600 border-emerald-200" : "text-warm-500"}`}
                        onClick={async () => {
                          const ok = await callAdmin("toggle_landing_approved", q.id, { current: q.is_approved });
                          if (ok) setLocalAll((prev) => prev.map((x) => x.id===q.id ? {...x, is_approved: !x.is_approved} : x));
                        }}>
                        <CheckCircle className="h-3 w-3" /> {q.is_approved ? "승인 해제" : "승인"}
                      </Button>
                      {/* Today 토글 */}
                      <Button size="sm" variant="outline"
                        className={`gap-1 h-7 text-xs ${q.is_today ? "text-amber-600 border-amber-200" : "text-warm-500"}`}
                        onClick={async () => {
                          const ok = await callAdmin("toggle_landing_today", q.id, { current: q.is_today });
                          if (ok) setLocalAll((prev) => {
                            const next = !q.is_today;
                            return prev.map((x) => x.id===q.id ? {...x, is_today: next} : {...x, is_today: next ? false : x.is_today});
                          });
                        }}>
                        📅 {q.is_today ? "Today 해제" : "Today 설정"}
                      </Button>
                      {/* 인기 토글 */}
                      <Button size="sm" variant="outline"
                        className={`gap-1 h-7 text-xs ${q.is_featured ? "text-blue-600 border-blue-200" : "text-warm-500"}`}
                        onClick={async () => {
                          const ok = await callAdmin("toggle_landing_featured", q.id, { current: q.is_featured });
                          if (ok) setLocalAll((prev) => prev.map((x) => x.id===q.id ? {...x, is_featured: !x.is_featured} : x));
                        }}>
                        <Star className="h-3 w-3" /> {q.is_featured ? "인기 해제" : "인기"}
                      </Button>
                      {/* 삭제 */}
                      <Button size="sm" variant="outline"
                        className="gap-1 h-7 text-xs text-red-500 border-red-200 hover:bg-red-50"
                        onClick={async () => {
                          if (!confirm("삭제할까요? 모든 답변도 함께 삭제됩니다.")) return;
                          const ok = await callAdmin("delete_landing_question", q.id);
                          if (ok) setLocalAll((prev) => prev.filter((x) => x.id !== q.id));
                        }}>
                        <Trash2 className="h-3 w-3" /> 삭제
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 미승인 질문 승인 탭 ── */}
        {tab === "landing_questions" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg font-semibold text-warm-900">미승인 질문 ({landingQuestions.length})</h2>
            </div>
            {landingQuestions.length === 0 ? (
              <p className="text-center py-12 text-warm-400 text-sm">승인 대기 중인 질문이 없습니다.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {landingQuestions.map((q) => (
                  <div key={q.id} className="rounded-xl border border-warm-100 p-4 bg-white flex items-start gap-4">
                    <div className="flex-1">
                      <p className="font-serif text-base text-warm-900 mb-1">{q.content}</p>
                      <div className="flex gap-3 text-xs text-warm-400">
                        <span>— {q.author_name}</span>
                        <span>{formatDate(q.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={async () => { const ok = await callAdmin("approve_landing_question", q.id); if (ok) router.refresh(); }}>
                        <CheckCircle className="h-3.5 w-3.5" />승인
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1 text-red-500 border-red-200 hover:bg-red-50"
                        onClick={async () => { const ok = await callAdmin("reject_landing_question", q.id); if (ok) router.refresh(); }}>
                        <XCircle className="h-3.5 w-3.5" />거절
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {pending && (
          <div className="fixed bottom-6 right-6 bg-warm-900 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2 shadow-lg">
            <RefreshCw className="h-4 w-4 animate-spin" />처리 중...
          </div>
        )}
      </div>
    </div>
  );
}
