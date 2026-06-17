"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Sparkles, SpellCheck, BookOpen, Megaphone, AlignLeft,
  Loader2, CheckCircle2, ChevronDown, ChevronUp, Copy,
} from "lucide-react";
import { aiApi } from "@/lib/publishing/api";

type Tool = "spell_check" | "summary" | "description" | "style_unify";

interface ToolConfig {
  key: Tool;
  label: string;
  desc: string;
  icon: typeof Sparkles;
  color: string;
}

const TOOLS: ToolConfig[] = [
  {
    key: "spell_check",
    label: "맞춤법 · 오탈자 검사",
    desc: "원고 전체에서 맞춤법 오류와 오탈자를 자동 탐지",
    icon: SpellCheck,
    color: "text-red-600 bg-red-50",
  },
  {
    key: "summary",
    label: "장별 요약",
    desc: "각 챕터의 핵심 내용을 2~3문장으로 요약",
    icon: AlignLeft,
    color: "text-blue-600 bg-blue-50",
  },
  {
    key: "description",
    label: "책 소개문 · 홍보문 생성",
    desc: "독자 관심을 끄는 소개문과 SNS용 홍보 문구 + 키워드",
    icon: Megaphone,
    color: "text-purple-600 bg-purple-50",
  },
  {
    key: "style_unify",
    label: "문체 통일 제안",
    desc: "경어/반말 혼용, 시제 불일치, 반복 표현 분석",
    icon: BookOpen,
    color: "text-green-600 bg-green-50",
  },
];

export default function AIToolsPage() {
  const params = useParams();
  const bookId = params.bookId as string;

  const [running, setRunning] = useState<Tool | null>(null);
  const [results, setResults] = useState<Record<Tool, any>>({} as any);
  const [expanded, setExpanded] = useState<Tool | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function run(tool: Tool) {
    setRunning(tool);
    try {
      let result;
      if (tool === "spell_check") result = await aiApi.spellCheck(bookId);
      else if (tool === "summary") result = await aiApi.generateSummary(bookId);
      else if (tool === "description") result = await aiApi.generateDescription(bookId);
      else result = await aiApi.unifyStyle(bookId);

      setResults((p) => ({ ...p, [tool]: result }));
      setExpanded(tool);
    } catch (err: any) {
      alert(`오류: ${err.message}`);
    } finally {
      setRunning(null);
    }
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">AI 편집 도구</h1>
        </div>
        <p className="text-sm text-gray-500">
          Claude AI가 원고를 분석하여 출판 품질을 높여드립니다
        </p>
      </div>

      <div className="space-y-4">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isRunning = running === tool.key;
          const result = results[tool.key];
          const isExpanded = expanded === tool.key && result;

          return (
            <div key={tool.key} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tool.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{tool.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{tool.desc}</p>
                </div>
                <div className="flex items-center gap-2">
                  {result && (
                    <button
                      onClick={() => setExpanded(isExpanded ? null : tool.key)}
                      className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                      결과 {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )}
                  <button
                    onClick={() => run(tool.key)}
                    disabled={!!running}
                    className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {isRunning ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> 분석 중...</>
                    ) : (
                      <><Sparkles className="w-3.5 h-3.5" /> 실행</>
                    )}
                  </button>
                </div>
              </div>

              {/* Result panel */}
              {isExpanded && result && (
                <div className="border-t border-gray-100 bg-gray-50 p-5">
                  <ToolResult toolKey={tool.key} result={result} onCopy={copy} copied={copied} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-indigo-50 rounded-xl p-5 border border-indigo-100">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-indigo-900">AI 편집 가이드</p>
            <p className="text-xs text-indigo-600 mt-1 leading-relaxed">
              원고를 먼저 업로드한 후 AI 도구를 실행해주세요.
              각 도구는 원고 전체를 분석하며, 결과는 참고용입니다.
              최종 편집 결정은 작가 본인이 내려주세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolResult({
  toolKey, result, onCopy, copied,
}: {
  toolKey: Tool;
  result: any;
  onCopy: (text: string, key: string) => void;
  copied: string | null;
}) {
  if (toolKey === "spell_check") {
    const suggestions: any[] = result.suggestions || [];
    return suggestions.length === 0 ? (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <CheckCircle2 className="w-4 h-4" />
        맞춤법 오류가 발견되지 않았습니다
      </div>
    ) : (
      <div className="space-y-3">
        <p className="text-xs font-medium text-gray-600">{suggestions.length}개 항목 발견</p>
        {suggestions.map((s, i) => (
          <div key={i} className="bg-white rounded-lg p-3 border border-red-100">
            <div className="flex items-start gap-2">
              <div className="shrink-0 mt-0.5">
                <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">오류</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 font-medium">{s.text}</p>
                <p className="text-xs text-red-600 mt-0.5">{s.issue}</p>
                <p className="text-xs text-green-700 mt-0.5">
                  <span className="font-medium">수정:</span> {s.suggestion}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (toolKey === "summary") {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-gray-600">요약 결과</p>
          <CopyButton text={result.summary} id="summary" onCopy={onCopy} copied={copied} />
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{result.summary}</p>
        </div>
      </div>
    );
  }

  if (toolKey === "description") {
    return (
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-600">책 소개문</p>
            <CopyButton text={result.description} id="desc" onCopy={onCopy} copied={copied} />
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-700 leading-relaxed">{result.description}</p>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-600">SNS 홍보 문구</p>
            <CopyButton text={result.promo} id="promo" onCopy={onCopy} copied={copied} />
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-700 font-medium">{result.promo}</p>
          </div>
        </div>
        {result.keywords?.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">추천 키워드</p>
            <div className="flex flex-wrap gap-2">
              {result.keywords.map((kw: string) => (
                <span key={kw} className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
                  #{kw}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (toolKey === "style_unify") {
    const suggestions: string[] = result.suggestions || [];
    return (
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-600">{suggestions.length}개 제안</p>
        {suggestions.map((s, i) => (
          <div key={i} className="flex items-start gap-2 bg-white rounded-lg p-3 border border-gray-200">
            <span className="text-xs font-bold text-indigo-600 shrink-0 mt-0.5">{i + 1}</span>
            <p className="text-sm text-gray-700 leading-relaxed">{s}</p>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

function CopyButton({
  text, id, onCopy, copied,
}: {
  text: string; id: string; onCopy: (t: string, k: string) => void; copied: string | null;
}) {
  return (
    <button
      onClick={() => onCopy(text, id)}
      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
    >
      {copied === id ? (
        <><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> 복사됨</>
      ) : (
        <><Copy className="w-3.5 h-3.5" /> 복사</>
      )}
    </button>
  );
}
