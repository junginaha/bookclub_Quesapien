"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/* ============================= 문항 정의 ============================= */
type QType = "short" | "long" | "single" | "multi" | "scale" | "ranking";
interface Question {
  id: string;
  section: string;
  secTitle?: string;
  secDesc?: string;
  type: QType;
  required: boolean;
  title: string;
  hint?: string;
  options?: string[];
  other?: boolean;
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  nps?: boolean;
}

const QUESTIONS: Question[] = [
  {
    id: "name", section: "0", secTitle: "테스터 정보", type: "short", required: true,
    title: "성함", hint: "중복 참여 방지·테스트 관리 목적으로만 사용됩니다.",
  },
  // SECTION 1
  {
    id: "q1_1", section: "1", secTitle: "테스터 프로파일링",
    secDesc: "직군·연차별 세그먼트 교차 분석을 위한 문항입니다.",
    type: "single", required: true, other: true, title: "주 전문 분야(직무)는 무엇입니까?",
    options: ["프론트엔드(Frontend) 개발", "백엔드 / 인프라(Backend/Infra) 개발", "UI/UX 디자인 / 프로덕트 디자인", "기획 / PM / PO"],
  },
  {
    id: "q1_2", section: "1", type: "single", required: true, title: "실무 경력(연차)은 어떻게 되십니까?",
    options: ["주니어 (3년 미만)", "미들 (3년 이상 ~ 7년 미만)", "시니어 (7년 이상 ~ 10년 미만)", "리더 / 디렉터 급 (10년 이상)"],
  },
  {
    id: "q1_3", section: "1", type: "multi", required: true, title: "검증 디바이스 환경 (복수 선택)",
    options: ["Desktop", "Mobile", "Tablet"],
  },
  {
    id: "q1_4", section: "1", type: "short", required: false, title: "검증 환경의 OS·브라우저",
    hint: "예: macOS / Chrome 125, iOS 18 / Safari",
  },
  // SECTION 2
  {
    id: "q2_1", section: "2", secTitle: "제품 아이덴티티 및 가치 제안",
    secDesc: "콘셉트가 전문가 관점에서 시장 경쟁력이 있는지 검증합니다.",
    type: "single", required: true, title: "진입 후 3초 이내에 핵심 가치와 정체성이 직관적으로 인지되었습니까?",
    options: ["전혀 인지되지 않음 (매우 모호함)", "다소 모호함", "보통이다", "비교적 명확히 인지됨", "매우 명확히 인지됨 (임팩트가 있음)"],
  },
  {
    id: "q2_2", section: "2", type: "short", required: false, title: "핵심 타깃 유저가 누구라고 인지되셨습니까?",
    hint: "예: AI 시대에 사고력을 단련하려는 지식 노동자 등",
  },
  {
    id: "q2_3", section: "2", type: "long", required: true,
    title: "기존 플랫폼(Stack Overflow, Quora, 지식iN) 대비 '질문하는 사람들' 콘셉트의 시장 차별성·포지셔닝 잠재력을 평가해 주세요.",
  },
  // SECTION 3
  {
    id: "q3_1", section: "3", secTitle: "UI/UX 및 Interaction",
    secDesc: "컴포넌트 일관성, 사용성 흐름, 마이크로 카피의 적절성을 측정합니다.",
    type: "single", required: true, title: "전반적 디자인 시스템 완성도(톤앤매너·타이포·여백·다크/라이트)는?",
    options: ["매우 미흡함 (전면 수정 필요)", "다소 아쉬움 (디테일 보완 필요)", "보통이다", "완성도 높은 편이다", "리덕션과 시각적 밸런스가 매우 훌륭하다"],
  },
  {
    id: "q3_2", section: "3", type: "scale", required: true, min: 1, max: 7,
    title: "[SEQ] '질문 등록 → 타인 질문에 인터랙션' 과업 수행이 얼마나 쉬웠습니까?",
    minLabel: "매우 어려움", maxLabel: "매우 쉬움",
  },
  {
    id: "q3_3", section: "3", type: "long", required: true,
    title: "위 유저 저니에서 인지 부하를 유발하거나 흐름이 매끄럽지 못했던 병목 구간이 있었다면?",
  },
  {
    id: "q3_4", section: "3", type: "long", required: false,
    title: "마이크로 카피·정보 구조(IA) 개선 의견이 있다면 적어주세요.",
  },
  // SECTION 4
  {
    id: "q4_1", section: "4", secTitle: "엔지니어링 · 성능",
    secDesc: "구현력, 렌더링 최적화 및 프로덕션 출시 가부를 평가합니다.",
    type: "single", required: true, title: "전반적 웹 퍼포먼스 체감 수준(라우팅·스켈레톤·렌더링 속도)은?",
    options: ["매우 답답함 (성능 최적화 시급)", "다소 지연이 느껴짐", "보통이다 (일반적 웹앱 수준)", "쾌적하고 빠른 편이다", "최적화가 매우 잘 되어 매끄럽다"],
  },
  {
    id: "q4_2", section: "4", type: "long", required: false,
    title: "크리티컬 버그(Layout Shift·반응형 오류·미작동)나 FE/BE 최적화 기술 팁을 제안해 주세요.",
    hint: "예: 768px에서 헤더 겹침, Lighthouse LCP 개선 제언 등",
  },
  // SECTION 5
  {
    id: "q5_1", section: "5", secTitle: "그로스 · 게이미피케이션",
    secDesc: "초기 활성화(Cold Start)와 이탈 방지 장치를 설계하기 위한 문항입니다.",
    type: "ranking", required: true, title: "전문가 리텐션에 효과적인 요소를 우선순위 순으로 정렬해 주세요. (1위 = 가장 중요)",
    options: ["질문 등급제 / 큐레이션", "배지·평판 시스템 (전문성 인증)", "질문 체인 (질문→질문 확장)", "주간 베스트 질문 / 명예의 전당", "AI 답변과 인간 답변의 비교·병치", "분야별 전문가 멘션·팔로우"],
  },
  {
    id: "q5_2", section: "5", type: "long", required: false,
    title: "반드시 필요한 핵심 피처·게이미피케이션 아이디어가 있다면 자유롭게 제안해 주세요.",
  },
  // SECTION 6
  {
    id: "q6_1", section: "6", secTitle: "비즈니스 모델 · 가격 수용성",
    secDesc: "데이터 자산화 가능성과 지불 의향을 검증합니다.",
    type: "single", required: true, title: "프리미엄(유료) 기능 제공 시 적정하다고 느끼는 비용 수준은?",
    options: ["무료여야 한다 (유료화 시 이탈)", "월 1,000~3,000원 (가벼운 후원 수준)", "월 5,000~9,000원", "월 10,000원 이상", "가격보다 가치가 중요 — 유용하면 비싸도 무관"],
  },
  {
    id: "q6_2", section: "6", type: "long", required: false,
    title: "어떤 기능·가치가 있다면 기꺼이 비용을 지불하시겠습니까?",
  },
  {
    id: "q6_3", section: "6", type: "long", required: false,
    title: "'양질의 질문·사유 데이터'를 활용한 BM '신의 한 수' 아이디어가 있다면 기술해 주세요.",
  },
  // SECTION 7
  {
    id: "q7_1", section: "7", secTitle: "종합 평가", type: "scale", required: true, min: 0, max: 10, nps: true,
    title: "[NPS] 동료 전문가에게 이 서비스를 추천할 의향은?",
    minLabel: "전혀 추천 안 함", maxLabel: "적극 추천",
  },
  {
    id: "q7_2", section: "7", type: "single", required: true, title: "현재 베타의 정식 출시(Production Ready) 준비도는?",
    options: ["지금 출시해도 무방한 수준이다", "일부 보완 후 조건부 출시 가능하다", "핵심 개선이 더 필요하다 (시기상조)"],
  },
  {
    id: "q7_3", section: "7", type: "short", required: true, title: "단 하나만 개선할 수 있다면, 무엇을 가장 먼저 고치시겠습니까?",
  },
  {
    id: "q7_4", section: "7", type: "long", required: false, title: "그 외 자유롭게 남기고 싶은 의견이 있다면 적어주세요.",
  },
];

type AnswerMap = Record<string, string | string[] | number | undefined>;

function isAnswered(q: Question, state: AnswerMap): boolean {
  const v = state[q.id];
  if (q.type === "multi") return Array.isArray(v) && v.length > 0;
  if (q.type === "single") {
    if (v === "__other__") return !!(state["__other_" + q.id] as string)?.trim();
    return v != null && v !== "";
  }
  if (q.type === "scale") return typeof v === "number";
  if (q.type === "ranking") return true;
  return v != null && v !== "";
}

/* ============================= 결과 집계 helpers ============================= */
type RawResponse = { id: string; created_at: string; answers: AnswerMap };

function esc(s: string): string {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] ?? c));
}

/* ============================= SURVEY FORM ============================= */
function SurveyForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [state, setState] = useState<AnswerMap>(() => {
    const init: AnswerMap = {};
    QUESTIONS.filter((q) => q.type === "ranking").forEach((q) => { init[q.id] = q.options!.slice(); });
    return init;
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const wrapRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const update = useCallback((key: string, val: AnswerMap[string]) => {
    setState((prev: AnswerMap) => ({ ...prev, [key]: val }));
  }, []);

  const reqQuestions = QUESTIONS.filter((q) => q.required);
  const doneCount = reqQuestions.filter((q) => isAnswered(q, state)).length;
  const progress = Math.round((doneCount / reqQuestions.length) * 100);

  function moveRank(qid: string, i: number, dir: number) {
    const arr = [...(state[qid] as string[])];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    update(qid, arr);
  }

  async function submit() {
    const missing = QUESTIONS.filter((q) => q.required && !isAnswered(q, state));
    if (missing.length) {
      setError(`필수 문항 ${missing.length}개가 비어 있습니다: ${missing.slice(0, 3).map((m) => m.title.slice(0, 14)).join(", ")}${missing.length > 3 ? " 외" : ""}`);
      const first = wrapRefs.current[missing[0].id];
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setError("");
    setSaving(true);
    const answers: AnswerMap = {};
    QUESTIONS.forEach((q) => {
      let v = state[q.id];
      if (q.type === "single" && v === "__other__") v = "기타: " + ((state["__other_" + q.id] as string) ?? "");
      answers[q.id] = v ?? "";
    });
    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: sbErr } = await (supabase as any).from("ut_responses").insert({ answers });
      if (sbErr) throw new Error(sbErr.message);
      onSubmitted();
    } catch {
      setError("저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  }

  let curSec: string | null = null;

  return (
    <div>
      {/* Progress */}
      <div style={{ height: 4, background: "rgba(33,28,22,.08)", borderRadius: 99, overflow: "hidden", margin: "22px 0 6px" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: "var(--accent)", transition: "width .4s ease" }} />
      </div>
      <p style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 26 }}>
        필수 문항 {doneCount} / {reqQuestions.length} 응답
      </p>

      {/* Intro */}
      <div className="ut-intro">
        <p>IT 실무자·전문가(개발자, 기획자, UI/UX 디자이너, PM/PO)를 모시고 진행하는 제품 수용성 테스트입니다. 기술 완성도, UI/UX 정밀도, 비즈니스 확장성을 전문가의 시선에서 평가해 주세요.</p>
        <p style={{ marginBottom: 0 }}>응답은 정식 출시 아키텍처 및 피처 백로그 수립의 핵심 데이터로 활용되며, 집계·분석을 위해 저장됩니다.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
          <span className="ut-chip">⏱ 약 8~10분</span>
          <span className="ut-chip">🔒 성함은 테스트 관리용</span>
        </div>
      </div>

      {QUESTIONS.map((q) => {
        const showSection = q.section !== "0" && q.section !== curSec;
        if (showSection) curSec = q.section;
        return (
          <div key={q.id}>
            {showSection && (
              <div>
                <div className="ut-section-head">
                  <span className="ut-section-num">{q.section}</span>
                  <h3 className="ut-section-title">{q.secTitle}</h3>
                </div>
                {q.secDesc && <p className="ut-section-desc">{q.secDesc}</p>}
              </div>
            )}
            <div className="ut-q" ref={(el) => { wrapRefs.current[q.id] = el; }}>
              <p className="ut-q-title">
                {q.title}
                {q.required && <span style={{ color: "var(--accent)", fontWeight: 700, marginLeft: 6 }}>*</span>}
              </p>
              {q.hint && <p className="ut-q-hint">{q.hint}</p>}
              <QuestionInput q={q} state={state} update={update} moveRank={moveRank} />
            </div>
          </div>
        );
      })}

      {error && (
        <div style={{ color: "var(--accent-ink)", fontSize: 13, background: "var(--accent-soft)", borderRadius: 9, padding: "11px 14px", marginBottom: 12 }}>
          {error}
        </div>
      )}
      <button className="ut-btn-primary" onClick={submit} disabled={saving}>
        {saving ? "저장 중…" : "응답 제출하기"}
      </button>
    </div>
  );
}

/* ============================= 개별 문항 입력 ============================= */
function QuestionInput({ q, state, update, moveRank }: {
  q: Question;
  state: AnswerMap;
  update: (k: string, v: AnswerMap[string]) => void;
  moveRank: (qid: string, i: number, dir: number) => void;
}) {
  if (q.type === "short") {
    return (
      <input
        type="text"
        className="ut-input"
        value={(state[q.id] as string) ?? ""}
        placeholder={q.hint ?? "답안을 입력하세요"}
        onChange={(e) => update(q.id, e.target.value)}
      />
    );
  }
  if (q.type === "long") {
    return (
      <textarea
        className="ut-textarea"
        value={(state[q.id] as string) ?? ""}
        placeholder="답안을 입력하세요"
        onChange={(e) => update(q.id, e.target.value)}
      />
    );
  }
  if (q.type === "single") {
    const val = state[q.id] as string | undefined;
    const otherVal = state["__other_" + q.id] as string | undefined;
    return (
      <div>
        {q.options!.map((opt) => (
          <label key={opt} className={`ut-opt${val === opt ? " sel" : ""}`}>
            <input type="radio" name={q.id} value={opt} checked={val === opt} onChange={() => update(q.id, opt)} />
            <span>{opt}</span>
          </label>
        ))}
        {q.other && (
          <>
            <label className={`ut-opt${val === "__other__" ? " sel" : ""}`}>
              <input type="radio" name={q.id} value="__other__" checked={val === "__other__"} onChange={() => update(q.id, "__other__")} />
              <span>기타 (직접 입력)</span>
            </label>
            {val === "__other__" && (
              <input
                type="text"
                className="ut-input"
                style={{ marginTop: 6 }}
                value={otherVal ?? ""}
                placeholder="직접 입력"
                onChange={(e) => update("__other_" + q.id, e.target.value)}
              />
            )}
          </>
        )}
      </div>
    );
  }
  if (q.type === "multi") {
    const vals = (state[q.id] as string[]) ?? [];
    return (
      <div>
        {q.options!.map((opt) => {
          const checked = vals.includes(opt);
          return (
            <label key={opt} className={`ut-opt${checked ? " sel" : ""}`}>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => {
                  const next = checked ? vals.filter((v) => v !== opt) : [...vals, opt];
                  update(q.id, next);
                }}
              />
              <span>{opt}</span>
            </label>
          );
        })}
      </div>
    );
  }
  if (q.type === "scale") {
    const val = state[q.id] as number | undefined;
    const buttons: number[] = [];
    for (let v = q.min!; v <= q.max!; v++) buttons.push(v);
    return (
      <div>
        <div className="ut-scale">
          {buttons.map((v) => (
            <button key={v} type="button" className={`ut-scale-btn${val === v ? " sel" : ""}`} onClick={() => update(q.id, v)}>
              {v}
            </button>
          ))}
        </div>
        <div className="ut-scale-labels">
          <span>{q.minLabel ?? q.min}</span>
          <span>{q.maxLabel ?? q.max}</span>
        </div>
      </div>
    );
  }
  if (q.type === "ranking") {
    const order = (state[q.id] as string[]) ?? q.options!;
    return (
      <div>
        {order.map((opt, i) => (
          <div key={opt} className="ut-rank-item">
            <span className="ut-rank-no">{i + 1}</span>
            <span style={{ flex: 1, fontSize: 14 }}>{opt}</span>
            <span style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <button type="button" className="ut-rank-btn" onClick={() => moveRank(q.id, i, -1)} disabled={i === 0}>▲</button>
              <button type="button" className="ut-rank-btn" onClick={() => moveRank(q.id, i, 1)} disabled={i === order.length - 1}>▼</button>
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

/* ============================= RESULTS ============================= */
function ResultsView() {
  const [data, setData] = useState<RawResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: rows } = await (supabase as any)
        .from("ut_responses")
        .select("id, created_at, answers")
        .order("created_at", { ascending: false });
      setData(rows ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleClear() {
    if (!confirm("저장된 모든 응답을 삭제합니다. 되돌릴 수 없습니다. 계속할까요?")) return;
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("ut_responses").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    load();
  }

  function exportCSV() {
    if (!data.length) { alert("내보낼 응답이 없습니다."); return; }
    const cols = ["created_at", ...QUESTIONS.map((q) => q.id)];
    const head = ["제출시각", ...QUESTIONS.map((q) => q.title.replace(/[\[\]"]/g, "").slice(0, 40))];
    const cell = (s: string) => { const x = String(s).replace(/"/g, '""'); return /[",\n]/.test(x) ? `"${x}"` : x; };
    const lines = [head.map(cell).join(",")];
    data.forEach((r) => {
      lines.push(cols.map((c) => {
        let v: unknown = c === "created_at" ? r.created_at : r.answers[c];
        if (Array.isArray(v)) v = v.join(" | ");
        return cell(v == null ? "" : String(v));
      }).join(","));
    });
    const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "quasapiens_ut_responses.csv";
    document.body.appendChild(a); a.click(); a.remove();
  }

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, margin: "20px 0 8px" }}>
        <div className="ut-stat">
          <div className="ut-stat-n">{data.length}</div>
          <div className="ut-stat-l">총 응답</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginLeft: "auto" }}>
          <button className="ut-ghost-btn" onClick={load}>↻ 새로고침</button>
          <button className="ut-ghost-btn" onClick={exportCSV}>CSV 내보내기</button>
          <button className="ut-ghost-btn danger" onClick={handleClear}>전체 삭제</button>
        </div>
      </div>
      <div style={{ fontSize: 12, color: "var(--ink-soft)", background: "var(--paper-2)", border: "1px dashed rgba(33,28,22,.14)", borderRadius: 10, padding: "11px 14px", margin: "14px 0 6px" }}>
        📊 이 화면은 제출된 <b>모든 응답을 누적 집계</b>합니다.
      </div>
      {loading ? (
        <p style={{ color: "var(--ink-soft)", fontStyle: "italic" }}>불러오는 중…</p>
      ) : data.length === 0 ? (
        <p style={{ color: "var(--ink-soft)", fontStyle: "italic" }}>아직 제출된 응답이 없습니다.</p>
      ) : (
        <>
          {QUESTIONS.map((q) => (
            <div key={q.id} className="ut-res-q">
              <h4 style={{ fontSize: 14.5, fontWeight: 600, margin: "0 0 14px" }}>
                <span style={{ color: "var(--accent)", fontWeight: 700, marginRight: 7, fontFamily: "var(--serif)" }}>
                  {q.section === "0" ? "·" : q.section}
                </span>
                {q.title}
              </h4>
              <AggregateView q={q} data={data} />
            </div>
          ))}
          <details style={{ marginTop: 30 }}>
            <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: 14, color: "var(--accent-ink)" }}>원본 응답 데이터 (JSON) 보기</summary>
            <pre style={{ background: "var(--ink)", color: "#EDE6D8", padding: 16, borderRadius: 10, overflow: "auto", fontSize: 12, lineHeight: 1.5, maxHeight: 340 }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </>
      )}
    </div>
  );
}

function AggregateView({ q, data }: { q: Question; data: RawResponse[] }) {
  if (q.type === "single" || q.type === "multi") {
    const counts: Record<string, number> = {};
    q.options!.forEach((o) => { counts[o] = 0; });
    const others: string[] = [];
    data.forEach((r) => {
      const v = r.answers[q.id];
      if (q.type === "multi") {
        (Array.isArray(v) ? v : []).forEach((x) => { counts[x as string] = (counts[x as string] ?? 0) + 1; });
      } else {
        if (typeof v === "string" && v.startsWith("기타:")) {
          others.push(v.replace("기타:", "").trim());
          counts["기타"] = (counts["기타"] ?? 0) + 1;
        } else if (v) {
          counts[v as string] = (counts[v as string] ?? 0) + 1;
        }
      }
    });
    const denom = q.type === "multi" ? data.length : data.filter((r) => r.answers[q.id]).length || 1;
    const maxVal = Math.max(1, ...Object.values(counts));
    return (
      <div>
        {Object.entries(counts).map(([k, c]) => {
          const pct = Math.round((c / denom) * 100);
          return (
            <div key={k} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 3 }}>
                <span>{k}</span>
                <span style={{ color: "var(--ink-soft)" }}>{c}명 · {pct}%</span>
              </div>
              <div style={{ height: 11, background: "rgba(33,28,22,.08)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(c / maxVal) * 100}%`, background: "var(--accent)", borderRadius: 99 }} />
              </div>
            </div>
          );
        })}
        {others.length > 0 && (
          <div style={{ marginTop: 8 }}>
            {others.map((o, i) => (
              <div key={i} style={{ background: "var(--paper-2)", border: "1px solid rgba(33,28,22,.08)", borderLeft: "3px solid var(--accent-soft)", borderRadius: 8, padding: "11px 14px", margin: "6px 0", fontSize: 14 }}>
                {o || "(미기재)"}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (q.type === "scale") {
    const vals = data.map((r) => r.answers[q.id]).filter((v): v is number => typeof v === "number");
    if (!vals.length) return <p style={{ color: "var(--ink-soft)", fontStyle: "italic" }}>응답 없음</p>;
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    const dist: Record<number, number> = {};
    for (let v = q.min!; v <= q.max!; v++) dist[v] = 0;
    vals.forEach((v) => { dist[v]++; });
    const maxD = Math.max(1, ...Object.values(dist));

    let npsEl = null;
    if (q.nps) {
      const prom = vals.filter((v) => v >= 9).length;
      const det = vals.filter((v) => v <= 6).length;
      const pas = vals.length - prom - det;
      const nps = Math.round(((prom - det) / vals.length) * 100);
      const w = (n: number) => vals.length ? (n / vals.length) * 100 : 0;
      npsEl = (
        <>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", margin: "4px 0 16px" }}>
            <div>
              <div style={{ fontFamily: "var(--serif)", fontWeight: 800, fontSize: 30, color: "var(--accent)", lineHeight: 1 }}>{avg.toFixed(2)}</div>
              <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 3 }}>평균 (0~10)</div>
            </div>
            <div>
              <div style={{ fontFamily: "var(--serif)", fontWeight: 800, fontSize: 30, color: "var(--accent)", lineHeight: 1 }}>{nps > 0 ? "+" : ""}{nps}</div>
              <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 3 }}>NPS 점수</div>
            </div>
          </div>
          <div style={{ display: "flex", height: 30, borderRadius: 8, overflow: "hidden", fontSize: 11, marginBottom: 12 }}>
            <div style={{ width: `${w(det)}%`, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600 }}>
              {det > 0 ? `비추천 ${det}` : ""}
            </div>
            <div style={{ width: `${w(pas)}%`, background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600 }}>
              {pas > 0 ? `중립 ${pas}` : ""}
            </div>
            <div style={{ width: `${w(prom)}%`, background: "#3E6B4F", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600 }}>
              {prom > 0 ? `추천 ${prom}` : ""}
            </div>
          </div>
        </>
      );
    } else {
      npsEl = (
        <div style={{ fontFamily: "var(--serif)", fontWeight: 800, fontSize: 30, color: "var(--accent)", lineHeight: 1, marginBottom: 16 }}>
          {avg.toFixed(2)} <span style={{ fontSize: 12, color: "var(--ink-soft)", fontFamily: "var(--sans)", fontWeight: 400 }}>평균 ({q.min}~{q.max})</span>
        </div>
      );
    }

    return (
      <div>
        {npsEl}
        {Object.entries(dist).map(([v, c]) => (
          <div key={v} style={{ marginBottom: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 2 }}>
              <span>{v}점</span>
              <span style={{ color: "var(--ink-soft)" }}>{c}명</span>
            </div>
            <div style={{ height: 11, background: "rgba(33,28,22,.08)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(c / maxD) * 100}%`, background: "#A07B2D", borderRadius: 99 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (q.type === "ranking") {
    const sums: Record<string, number> = {};
    const cnt: Record<string, number> = {};
    q.options!.forEach((o) => { sums[o] = 0; cnt[o] = 0; });
    data.forEach((r) => {
      const ord = r.answers[q.id];
      if (Array.isArray(ord)) {
        ord.forEach((o, i) => {
          if (sums[o as string] != null) { sums[o as string] += i + 1; cnt[o as string]++; }
        });
      }
    });
    const avgs = q.options!.map((o) => ({ o, a: cnt[o] ? sums[o] / cnt[o] : q.options!.length })).sort((x, y) => x.a - y.a);
    const worst = q.options!.length;
    return (
      <div>
        {avgs.map((it, idx) => (
          <div key={it.o} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 2 }}>
              <span><b style={{ color: "var(--accent)" }}>{idx + 1}위</b> &nbsp;{it.o}</span>
              <span style={{ color: "var(--ink-soft)" }}>평균 순위 {it.a.toFixed(2)}</span>
            </div>
            <div style={{ height: 11, background: "rgba(33,28,22,.08)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(1 - (it.a - 1) / (worst - 1)) * 100}%`, background: idx === 0 ? "var(--accent)" : "#A07B2D", borderRadius: 99 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // text
  const texts = data.map((r) => ({ who: (r.answers["name"] as string) || "익명", t: r.answers[q.id] as string })).filter((x) => x.t?.trim());
  if (!texts.length) return <p style={{ color: "var(--ink-soft)", fontStyle: "italic" }}>응답 없음</p>;
  return (
    <div>
      {texts.map((x, i) => (
        <div key={i} style={{ background: "var(--paper-2)", border: "1px solid rgba(33,28,22,.08)", borderLeft: "3px solid var(--accent-soft)", borderRadius: 8, padding: "11px 14px", margin: "8px 0", fontSize: 14 }}>
          <div style={{ fontSize: 11, color: "var(--ink-soft)", marginBottom: 3 }}>{esc(x.who)}</div>
          {x.t}
        </div>
      ))}
    </div>
  );
}

/* ============================= PAGE ============================= */
type View = "survey" | "thanks" | "results";

export default function UTPage() {
  const [view, setView] = useState<View>("survey");

  return (
    <>
      <style>{`
        :root {
          --paper: #F4EFE6;
          --paper-2: #FBF8F1;
          --ink: #211C16;
          --ink-soft: #5C5448;
          --line: rgba(33,28,22,.14);
          --line-soft: rgba(33,28,22,.08);
          --accent: #B5492C;
          --accent-soft: #E9CDBF;
          --accent-ink: #7E2E18;
          --gold: #A07B2D;
          --ok: #3E6B4F;
          --serif: 'Nanum Myeongjo', serif;
          --sans: 'IBM Plex Sans KR', sans-serif;
        }
        .ut-page { font-family: var(--sans); color: var(--ink); background: var(--paper); min-height: 100vh; -webkit-font-smoothing: antialiased; }
        .ut-masthead { position: relative; overflow: hidden; border-bottom: 1.5px solid var(--ink); }
        .ut-mast-inner { max-width: 760px; margin: 0 auto; padding: 46px 22px 30px; position: relative; z-index: 2; }
        .ut-qmark { position: absolute; right: -10px; top: -40px; z-index: 1; font-family: var(--serif); font-weight: 800; font-size: 300px; line-height: 1; color: var(--accent); opacity: .10; pointer-events: none; user-select: none; }
        .ut-eyebrow { font-size: 11px; letter-spacing: .32em; text-transform: uppercase; color: var(--accent-ink); font-weight: 600; margin: 0 0 14px; }
        .ut-title { font-family: var(--serif); font-weight: 800; font-size: clamp(30px,6vw,46px); line-height: 1.08; margin: 0 0 10px; letter-spacing: -.5px; }
        .ut-title-en { display: block; font-size: .42em; letter-spacing: .18em; color: var(--ink-soft); font-weight: 400; margin-top: 8px; text-transform: uppercase; }
        .ut-lede { max-width: 560px; color: var(--ink-soft); font-size: 15px; margin: 6px 0 0; }
        .ut-tabs { display: flex; gap: 6px; margin-top: 26px; }
        .ut-tab { font-family: var(--sans); font-weight: 600; font-size: 13.5px; border: 1.5px solid var(--ink); background: transparent; color: var(--ink); padding: 9px 18px; border-radius: 999px; cursor: pointer; transition: .16s; }
        .ut-tab.active { background: var(--ink); color: var(--paper); }
        .ut-tab:not(.active):hover { background: rgba(33,28,22,.06); }
        .ut-wrap { max-width: 760px; margin: 0 auto; padding: 0 22px 120px; }
        .ut-intro { background: var(--paper-2); border: 1px solid var(--line); border-radius: 14px; padding: 22px 24px; margin: 22px 0 30px; font-size: 14px; color: var(--ink-soft); }
        .ut-intro p { margin: 0 0 10px; }
        .ut-chip { font-size: 12px; background: var(--accent-soft); color: var(--accent-ink); padding: 4px 12px; border-radius: 99px; font-weight: 600; }
        .ut-section-head { display: flex; align-items: baseline; gap: 12px; margin: 42px 0 4px; padding-bottom: 10px; border-bottom: 1.5px solid var(--ink); }
        .ut-section-num { font-family: var(--serif); font-weight: 800; font-size: 30px; color: var(--accent); line-height: 1; }
        .ut-section-title { font-family: var(--serif); font-weight: 700; font-size: 20px; margin: 0; }
        .ut-section-desc { font-size: 13px; color: var(--ink-soft); margin: 8px 0 20px; }
        .ut-q { margin: 0 0 26px; }
        .ut-q-title { font-size: 15.5px; font-weight: 600; margin: 0 0 4px; }
        .ut-q-hint { font-size: 12.5px; color: var(--ink-soft); margin: 0 0 12px; }
        .ut-input { width: 100%; font-family: var(--sans); font-size: 14.5px; color: var(--ink); background: var(--paper-2); border: 1px solid var(--line); border-radius: 10px; padding: 12px 14px; transition: .15s; box-sizing: border-box; }
        .ut-textarea { width: 100%; font-family: var(--sans); font-size: 14.5px; color: var(--ink); background: var(--paper-2); border: 1px solid var(--line); border-radius: 10px; padding: 12px 14px; transition: .15s; resize: vertical; min-height: 96px; line-height: 1.55; box-sizing: border-box; }
        .ut-input:focus, .ut-textarea:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px rgba(181,73,44,.13); }
        .ut-opt { display: flex; align-items: flex-start; gap: 11px; padding: 11px 14px; margin: 7px 0; border: 1px solid var(--line); border-radius: 10px; cursor: pointer; background: var(--paper-2); transition: .14s; font-size: 14.5px; }
        .ut-opt:hover { border-color: var(--accent-soft); background: #fff; }
        .ut-opt.sel { border-color: var(--accent); background: #fff; box-shadow: 0 0 0 2px rgba(181,73,44,.1); }
        .ut-opt input { margin-top: 3px; accent-color: var(--accent); flex-shrink: 0; }
        .ut-scale { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 6px; }
        .ut-scale-btn { font-family: var(--sans); min-width: 42px; height: 42px; border-radius: 9px; border: 1px solid var(--line); background: var(--paper-2); color: var(--ink); font-size: 14px; font-weight: 600; cursor: pointer; transition: .13s; }
        .ut-scale-btn:hover { border-color: var(--accent-soft); }
        .ut-scale-btn.sel { background: var(--accent); color: #fff; border-color: var(--accent); }
        .ut-scale-labels { display: flex; justify-content: space-between; font-size: 11.5px; color: var(--ink-soft); margin-top: 7px; }
        .ut-rank-item { display: flex; align-items: center; gap: 12px; padding: 11px 14px; margin: 7px 0; border: 1px solid var(--line); border-radius: 10px; background: var(--paper-2); }
        .ut-rank-no { font-family: var(--serif); font-weight: 800; font-size: 18px; color: var(--accent); width: 24px; text-align: center; flex-shrink: 0; }
        .ut-rank-btn { width: 30px; height: 22px; border: 1px solid var(--line); background: #fff; border-radius: 6px; cursor: pointer; font-size: 11px; color: var(--ink-soft); line-height: 1; }
        .ut-rank-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
        .ut-rank-btn:disabled { opacity: .3; cursor: default; }
        .ut-btn-primary { font-family: var(--sans); font-weight: 700; font-size: 16px; color: var(--paper); background: var(--ink); border: none; border-radius: 12px; padding: 16px; cursor: pointer; transition: .15s; width: 100%; margin-top: 16px; }
        .ut-btn-primary:hover:not(:disabled) { background: var(--accent); }
        .ut-btn-primary:disabled { opacity: .6; cursor: default; }
        .ut-stat { background: var(--ink); color: var(--paper); border-radius: 14px; padding: 16px 22px; text-align: center; }
        .ut-stat-n { font-family: var(--serif); font-weight: 800; font-size: 34px; line-height: 1; }
        .ut-stat-l { font-size: 11px; letter-spacing: .1em; text-transform: uppercase; opacity: .7; margin-top: 4px; }
        .ut-ghost-btn { font-family: var(--sans); font-size: 13px; font-weight: 600; border: 1.5px solid var(--ink); background: transparent; color: var(--ink); border-radius: 99px; padding: 9px 16px; cursor: pointer; transition: .14s; }
        .ut-ghost-btn:hover { background: var(--ink); color: var(--paper); }
        .ut-ghost-btn.danger { border-color: var(--accent); color: var(--accent-ink); }
        .ut-ghost-btn.danger:hover { background: var(--accent); color: #fff; }
        .ut-res-q { margin: 30px 0; padding-bottom: 26px; border-bottom: 1px solid rgba(33,28,22,.08); }
        .ut-thanks { text-align: center; padding: 70px 20px; }
        .ut-thanks-big { font-family: var(--serif); font-size: 34px; font-weight: 800; margin: 0 0 12px; }
        .ut-link-btn { background: none; border: none; color: var(--accent); font-weight: 600; font-size: 14px; cursor: pointer; text-decoration: underline; font-family: var(--sans); }
      `}</style>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700;800&family=IBM+Plex+Sans+KR:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      <div className="ut-page">
        <header className="ut-masthead">
          <div className="ut-mast-inner">
            <div className="ut-qmark">?</div>
            <p className="ut-eyebrow">Expert Usability Test · Beta</p>
            <h1 className="ut-title">
              질문하는 사람들
              <span className="ut-title-en">Quasapiens</span>
            </h1>
            <p className="ut-lede">AI 시대, '인간다운 질문의 가치'를 탐구하는 담론 플랫폼의 베타 제품 평가 및 사용성 조사입니다.</p>
            <nav className="ut-tabs">
              <button className={`ut-tab${view === "survey" || view === "thanks" ? " active" : ""}`} onClick={() => setView("survey")}>설문 응답</button>
              <button className={`ut-tab${view === "results" ? " active" : ""}`} onClick={() => setView("results")}>결과 분석</button>
            </nav>
          </div>
        </header>

        <div className="ut-wrap">
          {view === "survey" && <SurveyForm onSubmitted={() => setView("thanks")} />}

          {view === "thanks" && (
            <div className="ut-thanks">
              <p className="ut-thanks-big">감사합니다 🙏</p>
              <p style={{ color: "var(--ink-soft)", margin: "0 0 24px" }}>
                소중한 전문 지식과 시간을 나누어 주셔서 깊이 감사드립니다.<br />
                피드백은 누락 없이 검토하여 고도화의 나침반으로 삼겠습니다.
              </p>
              <button className="ut-link-btn" onClick={() => setView("results")}>집계된 결과 분석 보기 →</button>
              <span style={{ display: "inline-block", width: 18 }} />
              <button className="ut-link-btn" onClick={() => setView("survey")}>새 응답 작성</button>
            </div>
          )}

          {view === "results" && <ResultsView />}
        </div>
      </div>
    </>
  );
}
