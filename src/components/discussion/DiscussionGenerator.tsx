"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Pencil, RefreshCw } from "lucide-react";
import "./discussion-generator.css";

interface DiscussionGeneratorProps {
  variant: "giants" | "landing";
}

type Depth = "first" | "general" | "deep";
type Status = "idle" | "loading" | "done" | "error";

interface EvidenceSource {
  provider: "Google Books" | "Open Library";
  label: string;
  url: string;
  matchedTitle: string;
  matchedAuthors: string[];
}

interface BookEvidence {
  verified: boolean;
  confidence: "high" | "medium" | "low";
  title: string;
  authors: string[];
  publisher?: string;
  publishedDate?: string;
  firstPublishYear?: number;
  isbn13?: string;
  isbn10?: string;
  categories: string[];
  subjects: string[];
  description?: string;
  sources: EvidenceSource[];
}

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
  evidence: BookEvidence;
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

const HANDOFF_KEY = "qsp_discussion_handoff";

const DEPTHS: { value: Depth; number: string; label: string; sub: string }[] = [
  { value: "first", number: "01", label: "가볍게", sub: "대화가 잘 열리는 질문" },
  { value: "general", number: "02", label: "적당히", sub: "논지와 경험을 균형 있게" },
  { value: "deep", number: "03", label: "깊이 있게", sub: "전제와 반론까지" },
];

const STAGE_LABEL: Record<DiscussionQuestion["stage"], string> = {
  opening: "대화 시작",
  deep: "심화",
  giant: "거인의 시선",
  closing: "마무리",
};

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
    const raw = window.sessionStorage.getItem(HANDOFF_KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw);
      setTitle(saved.title || "");
      setAuthor(saved.author || "");
      setDepth(saved.depth || "general");
      setResult(saved.result || null);
      if (saved.result) setStatus("done");
    } catch {
      // Ignore damaged local handoff state.
    }
    window.sessionStorage.removeItem(HANDOFF_KEY);
  }, [variant]);

  const valid = Boolean(title.trim() && author.trim());

  async function generate() {
    if (!valid || status === "loading") return;
    setStatus("loading");
    setErrorMessage("");
    setCopied(false);

    try {
      const response = await fetch("/api/discussion/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "book",
          title: title.trim(),
          author: author.trim(),
          depth,
          direction: "free",
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.result) {
        setErrorMessage(data.error || "발제를 만들지 못했습니다.");
        setStatus("error");
        return;
      }
      setResult(data.result);
      setStatus("done");

      if (variant === "landing") {
        window.sessionStorage.setItem(
          HANDOFF_KEY,
          JSON.stringify({ title: title.trim(), author: author.trim(), depth, result: data.result })
        );
      }
    } catch {
      setErrorMessage("네트워크 오류로 발제를 만들지 못했습니다.");
      setStatus("error");
    }
  }

  function reset() {
    setTitle("");
    setAuthor("");
    setDepth("general");
    setResult(null);
    setStatus("idle");
    setErrorMessage("");
  }

  function edit() {
    setResult(null);
    setStatus("idle");
    setErrorMessage("");
  }

  function copyAll() {
    if (!result) return;
    const text = result.questions
      .map((question) => question.number + ". " + question.question)
      .join("\n\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }).catch(() => {});
  }

  const questions = variant === "landing" ? result?.questions.slice(0, 3) : result?.questions;

  return (
    <div className={"dg dg--" + variant}>
      <div className="dg-machine">
        <div className="dg-device-top" aria-hidden="true">
          <span className="dg-slot-line" />
          <span className="dg-device-label">QSAPIENS · QUESTION MACHINE</span>
          <span className="dg-status-dot" />
        </div>

        <div className="dg-screen">
          <div className="dg-screen-meta">
            <span>BOOK TALK</span>
            <span>{status === "loading" ? "DATA CHECKING…" : "READY"}</span>
          </div>
          <p className="dg-screen-slogan">
            북토크의 완성은<br />
            <strong>좋은 질문.</strong>
          </p>

          <div className="dg-display-fields">
            <label>
              <span>BOOK</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="책 제목"
                maxLength={120}
                autoComplete="off"
              />
            </label>
            <label>
              <span>AUTHOR</span>
              <input
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                placeholder="저자"
                maxLength={80}
                autoComplete="off"
              />
            </label>
          </div>
        </div>

        <div className="dg-keypad">
          <div className="dg-keypad-head">
            <span>DIFFICULTY</span>
            <button type="button" className="dg-ac-key" onClick={reset}>AC</button>
          </div>

          <div className="dg-depth-grid" role="group" aria-label="발제 난이도">
            {DEPTHS.map((item) => (
              <button
                key={item.value}
                type="button"
                className={"dg-key " + (depth === item.value ? "is-active" : "")}
                onClick={() => setDepth(item.value)}
                aria-pressed={depth === item.value}
              >
                <span className="dg-key-num">{item.number}</span>
                <strong>{item.label}</strong>
                <small>{item.sub}</small>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="dg-enter-key"
            disabled={!valid || status === "loading"}
            onClick={() => void generate()}
          >
            <span>{status === "loading" ? "도서 데이터 확인 중…" : "발제 생성"}</span>
            <small>ENTER</small>
          </button>

          {status === "loading" && (
            <div className="dg-process" role="status">
              <span>01 BOOK DATA</span>
              <i />
              <span>02 FACT CHECK</span>
              <i />
              <span>03 QUESTIONS</span>
            </div>
          )}
          {status === "error" && <p className="dg-error" role="alert">{errorMessage}</p>}
        </div>
      </div>

      {status === "done" && result && (
        <div className="dg-output">
          <section className="dg-evidence" aria-labelledby="dg-evidence-title">
            <div className="dg-output-head">
              <div>
                <span className="dg-output-kicker">VERIFIED BOOK DATA</span>
                <h3 id="dg-evidence-title">{result.evidence.title}</h3>
                <p>{result.evidence.authors.join(", ")}</p>
              </div>
              <span className={"dg-verify-badge is-" + result.evidence.confidence}>
                {result.evidence.confidence === "high" ? "2중 대조" : "데이터 확인"}
              </span>
            </div>

            <dl className="dg-biblio">
              {result.evidence.publisher && <div><dt>출판사</dt><dd>{result.evidence.publisher}</dd></div>}
              {(result.evidence.publishedDate || result.evidence.firstPublishYear) && (
                <div><dt>출간</dt><dd>{result.evidence.publishedDate || String(result.evidence.firstPublishYear)}</dd></div>
              )}
              {(result.evidence.isbn13 || result.evidence.isbn10) && (
                <div><dt>ISBN</dt><dd>{result.evidence.isbn13 || result.evidence.isbn10}</dd></div>
              )}
            </dl>

            <div className="dg-source-links">
              {result.evidence.sources.map((source) => (
                <a key={source.provider} href={source.url} target="_blank" rel="noreferrer">
                  {source.provider} ↗
                </a>
              ))}
            </div>

            <details className="dg-analysis">
              <summary>데이터 기반 핵심 쟁점</summary>
              <p>{result.analysis.core_argument}</p>
              <div className="dg-concepts">
                {result.analysis.key_concepts.map((concept) => <span key={concept}>{concept}</span>)}
              </div>
            </details>
          </section>

          <section className="dg-questions" aria-labelledby="dg-questions-title">
            <div className="dg-output-head">
              <div>
                <span className="dg-output-kicker">QUESTION SET</span>
                <h3 id="dg-questions-title">좋은 질문</h3>
              </div>
              <div className="dg-output-actions">
                <button type="button" onClick={copyAll}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "복사됨" : "전체 복사"}
                </button>
                <button type="button" onClick={() => void generate()}><RefreshCw size={14} /> 다시 생성</button>
                <button type="button" onClick={edit}><Pencil size={14} /> 수정</button>
              </div>
            </div>

            <ol className="dg-question-list">
              {(questions || []).map((question) => (
                <li key={question.number}>
                  <span className="dg-question-num">{String(question.number).padStart(2, "0")}</span>
                  <div>
                    <small>{STAGE_LABEL[question.stage]}{question.thinker ? " · " + question.thinker : ""}</small>
                    <p>{question.question}</p>
                    {variant === "giants" && question.followup && <span className="dg-followup">↳ {question.followup}</span>}
                  </div>
                </li>
              ))}
            </ol>

            {variant === "landing" && (
              <a className="dg-full-link" href="/giants?handoff=1">발제 10개 전체 보기 →</a>
            )}

            {variant === "giants" && result.giants.length > 0 && (
              <div className="dg-giants-used">
                {result.giants.map((giant) => (
                  <span key={giant.slug}>{giant.name} · {giant.stance === "support" ? "지지 관점" : "비판 관점"}</span>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
