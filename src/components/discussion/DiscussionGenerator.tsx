"use client";

import { useEffect, useState } from "react";
import { Check, Copy, RefreshCw } from "lucide-react";
import "./discussion-generator.css";

interface DiscussionGeneratorProps { variant: "giants" | "landing"; }
type Depth = "first" | "general" | "deep";
type Status = "idle" | "loading" | "done" | "error";

interface EvidenceSource { provider: "Google Books" | "Open Library"; label: string; url: string; }
interface BookEvidence {
  confidence: "high" | "medium" | "low";
  title: string; authors: string[]; publisher?: string; publishedDate?: string;
  firstPublishYear?: number; isbn13?: string; isbn10?: string; sources: EvidenceSource[];
}
interface BackgroundSource { title: string; url: string; domain: string; }
interface BookBackground {
  fact: string; whyItMatters: string; questionSeed: string;
  confidence: "cross_checked" | "bibliographic_cross_check" | "source_verified";
  sources: BackgroundSource[];
}
interface DiscussionQuestion {
  number: number; stage: "opening" | "deep" | "giant" | "closing";
  question: string; intent: string; followup: string; concept: string;
  thinker?: string; background_linked?: boolean;
}
interface GiantUsed { slug: string; name: string; stance: "support" | "critical"; }
interface DiscussionResult {
  evidence: BookEvidence;
  background: BookBackground;
  analysis: { core_argument: string; key_concepts: string[]; };
  giants: GiantUsed[];
  questions: DiscussionQuestion[];
}

const HANDOFF_KEY = "qsp_discussion_handoff";
const DEPTHS: { value: Depth; number: string; label: string; sub: string }[] = [
  { value: "first", number: "1", label: "가볍게", sub: "말문이 쉽게 열리는 질문" },
  { value: "general", number: "2", label: "적당히", sub: "책과 경험을 오가는 질문" },
  { value: "deep", number: "3", label: "깊이 있게", sub: "전제와 반론까지 파고드는 질문" },
];
const STAGE_LABEL = { opening: "대화 시작", deep: "깊이 읽기", giant: "거인의 시선", closing: "마무리" };

export default function DiscussionGenerator({ variant }: DiscussionGeneratorProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [depth, setDepth] = useState<Depth>("general");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<DiscussionResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (variant !== "giants") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("handoff") !== "1") return;
    const raw = sessionStorage.getItem(HANDOFF_KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw);
      setTitle(saved.title || "");
      setAuthor(saved.author || "");
      setDepth(saved.depth || "general");
      setResult(saved.result || null);
      if (saved.result) setStatus("done");
    } catch {}
    sessionStorage.removeItem(HANDOFF_KEY);
  }, [variant]);

  const valid = Boolean(title.trim() && author.trim());

  async function generate() {
    if (!valid || status === "loading") return;
    setStatus("loading");
    setErrorMessage("");
    setResult(null);
    setCopied(false);

    try {
      const response = await fetch("/api/discussion/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "book", title: title.trim(), author: author.trim(), depth, direction: "free" }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.result) {
        setErrorMessage(data.error || "발제를 만들지 못했습니다. 잠시 후 다시 시도해주세요.");
        setStatus("error");
        return;
      }
      setResult(data.result);
      setStatus("done");
      if (variant === "landing") {
        sessionStorage.setItem(HANDOFF_KEY, JSON.stringify({ title: title.trim(), author: author.trim(), depth, result: data.result }));
      }
    } catch {
      setErrorMessage("연결이 잠시 불안정합니다. 입력 내용은 그대로 두었습니다. 다시 눌러주세요.");
      setStatus("error");
    }
  }

  function reset() {
    setTitle(""); setAuthor(""); setDepth("general"); setResult(null); setStatus("idle"); setErrorMessage("");
  }

  function copyAll() {
    if (!result) return;
    const sources = result.background.sources.map((source) => "- " + source.title + ": " + source.url).join("\n");
    const questions = result.questions.map((q) =>
      q.number + ". " + (q.background_linked ? "[숨은 배경] " : "") + q.question + (q.followup ? "\n   ↳ " + q.followup : "")
    ).join("\n\n");
    const text = [
      "『" + result.evidence.title + "』 · " + result.evidence.authors.join(", "),
      "", "[책의 숨은 배경]", result.background.fact, result.background.whyItMatters,
      "", "[확인 출처]", sources, "", "[발제]", questions,
    ].join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }).catch(() => {});
  }

  const questions = variant === "landing" ? result?.questions.slice(0, 3) : result?.questions;

  return (
    <div className={"dg dg--" + variant}>
      <section className="dg-machine" aria-label="북토크 발제 생성기">
        <header className="dg-machine-head">
          <div>
            <span>QUESTION MAKER</span>
            <h3>발제 생성기</h3>
          </div>
          <button type="button" className="dg-reset" onClick={reset}>처음부터</button>
        </header>

        <div className="dg-screen">
          <p>북토크의 완성은 <strong>좋은 질문</strong></p>
          <div className="dg-fields">
            <label>
              <span>책 제목</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 참을 수 없는 존재의 가벼움" maxLength={120} />
            </label>
            <label>
              <span>저자</span>
              <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="예: 밀란 쿤데라" maxLength={80} />
            </label>
          </div>
        </div>

        <div className="dg-controls">
          <div className="dg-control-label">
            <strong>난이도</strong>
            <span>모임의 분위기에 맞춰 고르세요.</span>
          </div>
          <div className="dg-depth-grid" role="group" aria-label="발제 난이도">
            {DEPTHS.map((item) => (
              <button key={item.value} type="button" className={"dg-key " + (depth === item.value ? "is-active" : "")}
                onClick={() => setDepth(item.value)} aria-pressed={depth === item.value}>
                <span className="dg-key-num">{item.number}</span>
                <strong>{item.label}</strong>
                <small>{item.sub}</small>
              </button>
            ))}
          </div>

          <button type="button" className="dg-enter" disabled={!valid || status === "loading"} onClick={() => void generate()}>
            <span>{status === "loading" ? "책을 확인하고 질문을 만들고 있어요…" : "좋은 질문 10개 만들기"}</span>
            <small>ENTER</small>
          </button>

          {status === "loading" && (
            <div className="dg-progress" role="status">
              <span>책 확인</span><i /><span>숨은 배경 조사</span><i /><span>팩트체크</span><i /><span>질문 설계</span>
            </div>
          )}

          {status === "error" && (
            <div className="dg-error" role="alert">
              <strong>생성이 멈췄습니다.</strong>
              <p>{errorMessage}</p>
              <button type="button" onClick={() => void generate()} disabled={!valid}>같은 내용으로 다시 시도</button>
            </div>
          )}
        </div>
      </section>

      {status === "done" && result && (
        <div className="dg-output">
          <section className="dg-evidence">
            <div className="dg-output-head">
              <div><span>확인된 책</span><h3>{result.evidence.title}</h3><p>{result.evidence.authors.join(", ")}</p></div>
              <span className="dg-verified">{result.evidence.confidence === "high" ? "2중 대조" : "서지 확인"}</span>
            </div>
            <dl className="dg-biblio">
              {result.evidence.publisher && <div><dt>출판사</dt><dd>{result.evidence.publisher}</dd></div>}
              {(result.evidence.publishedDate || result.evidence.firstPublishYear) && <div><dt>출간</dt><dd>{result.evidence.publishedDate || result.evidence.firstPublishYear}</dd></div>}
              {(result.evidence.isbn13 || result.evidence.isbn10) && <div><dt>ISBN</dt><dd>{result.evidence.isbn13 || result.evidence.isbn10}</dd></div>}
            </dl>
          </section>

          <section className="dg-background">
            <div className="dg-output-head">
              <div><span>FACT-CHECKED CONTEXT</span><h3>책의 숨은 배경</h3></div>
              <span className="dg-verified">
                {result.background.confidence === "cross_checked" ? "교차 검증" : result.background.confidence === "bibliographic_cross_check" ? "서지 교차 확인" : "출처 확인"}
              </span>
            </div>
            <p className="dg-background-fact">{result.background.fact}</p>
            <p className="dg-background-why">{result.background.whyItMatters}</p>
            <div className="dg-source-links">
              {result.background.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a>)}
            </div>
            <div className="dg-background-seed"><span>이 배경에서 시작하는 질문</span><p>{result.background.questionSeed}</p></div>
          </section>

          <section className="dg-questions">
            <div className="dg-output-head">
              <div><span>10 QUESTIONS</span><h3>이 책에서만 나올 수 있는 질문</h3></div>
              <div className="dg-output-actions">
                <button type="button" onClick={copyAll}>{copied ? <Check size={14}/> : <Copy size={14}/>} {copied ? "복사됨" : "전체 복사"}</button>
                <button type="button" onClick={() => void generate()}><RefreshCw size={14}/> 다시 만들기</button>
              </div>
            </div>
            <ol className="dg-question-list">
              {(questions || []).map((q) => (
                <li key={q.number} className={q.background_linked ? "is-background" : ""}>
                  <span className="dg-question-num">{String(q.number).padStart(2, "0")}</span>
                  <div>
                    <small>{STAGE_LABEL[q.stage]}{q.thinker ? " · " + q.thinker : ""}{q.background_linked ? " · 숨은 배경" : ""}</small>
                    <p>{q.question}</p>
                    {variant === "giants" && q.followup && <span className="dg-followup">↳ {q.followup}</span>}
                  </div>
                </li>
              ))}
            </ol>
            {variant === "landing" && <a className="dg-full-link" href="/giants?handoff=1">10개 질문 전체 보기 →</a>}
          </section>
        </div>
      )}
    </div>
  );
}
