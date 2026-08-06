"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import Link from "next/link";
import { PenLine } from "lucide-react";
import QuestionsClient from "./QuestionsClient";

export interface CommunityStats {
  questions: number;
  answers: number;
}

interface TrustedQuestionsClientProps {
  todayQuestion: unknown;
  featuredQuestions: unknown[];
  recentQuestions: unknown[];
  communityStats: CommunityStats | null;
}

interface ElementProps {
  children?: ReactNode;
  style?: CSSProperties;
}

function containsText(node: ReactNode, text: string): boolean {
  if (typeof node === "string" || typeof node === "number") {
    return String(node).includes(text);
  }
  if (Array.isArray(node)) return node.some((child) => containsText(child, text));
  if (!isValidElement<ElementProps>(node)) return false;
  return containsText(node.props.children, text);
}

function EmptySection({ eyebrow, message }: { eyebrow: string; message: string }) {
  return (
    <section>
      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--muted)",
          marginBottom: 20,
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          padding: "28px 24px",
          borderRadius: 12,
          border: "1px solid var(--line-soft)",
          background: "rgba(255,255,255,0.4)",
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
            fontSize: 14,
            lineHeight: 1.7,
            color: "var(--ink-soft)",
          }}
        >
          {message}
        </p>
      </div>
    </section>
  );
}

function VerifiedStatsCard({ stats }: { stats: CommunityStats | null }) {
  const entries = stats
    ? [
        { value: stats.questions.toLocaleString("ko-KR"), label: "공개 질문" },
        { value: stats.answers.toLocaleString("ko-KR"), label: "공개 답변" },
      ]
    : [];

  return (
    <div
      style={{
        padding: "22px 24px",
        borderRadius: 16,
        background: "var(--ink)",
        color: "var(--cream-on-dark)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.35)",
          marginBottom: 18,
        }}
      >
        질문 현황
      </div>

      {entries.length > 0 ? (
        entries.map((entry) => (
          <div key={entry.label} style={{ marginBottom: 16 }}>
            <div
              style={{
                fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                fontSize: 26,
                fontWeight: 400,
                color: "white",
                letterSpacing: "-0.02em",
              }}
            >
              {entry.value}
            </div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
              {entry.label}
            </div>
          </div>
        ))
      ) : (
        <p
          style={{
            margin: "0 0 16px",
            fontSize: 13,
            lineHeight: 1.7,
            color: "rgba(255,255,255,0.68)",
          }}
        >
          승인된 공개 데이터를 확인한 뒤 숫자를 표시합니다.
        </p>
      )}

      <div
        style={{
          fontSize: 11,
          lineHeight: 1.6,
          color: "rgba(255,255,255,0.38)",
          marginBottom: 16,
        }}
      >
        실제 공개 데이터 기준
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 16 }}>
        <Link
          href="/questions/create"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "10px 0",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.2)",
            fontSize: 13,
            color: "rgba(255,255,255,0.7)",
            textDecoration: "none",
          }}
        >
          <PenLine size={12} /> 질문 작성하기
        </Link>
      </div>
    </div>
  );
}

function sanitizeTree(
  node: ReactNode,
  options: {
    hasToday: boolean;
    hasFeatured: boolean;
    hasRecent: boolean;
    communityStats: CommunityStats | null;
  }
): ReactNode {
  if (!isValidElement<ElementProps>(node)) return node;

  const element = node as ReactElement<ElementProps>;
  const children = element.props.children;

  if (element.type === "section" && !options.hasToday && containsText(children, "오늘의 질문")) {
    return <EmptySection eyebrow="Today's Question — 오늘의 질문" message="오늘의 질문을 준비하고 있어요." />;
  }

  if (element.type === "section" && !options.hasFeatured && containsText(children, "인기 질문")) {
    return <EmptySection eyebrow="Popular — 인기 질문" message="실제 반응이 쌓인 질문부터 이곳에 소개할게요." />;
  }

  if (
    element.type === "section" &&
    !options.hasRecent &&
    (containsText(children, "최근 질문") || containsText(children, "검색 결과"))
  ) {
    return <EmptySection eyebrow="Recent — 최근 질문" message="아직 공개된 질문이 없어요. 첫 질문을 기다리고 있습니다." />;
  }

  if (
    element.type === "div" &&
    element.props.style?.background === "var(--ink)" &&
    containsText(children, "질문 현황")
  ) {
    return <VerifiedStatsCard stats={options.communityStats} />;
  }

  if (children === undefined) return element;

  return cloneElement(
    element,
    undefined,
    Children.map(children, (child) => sanitizeTree(child, options))
  );
}

export default function TrustedQuestionsClient({
  todayQuestion,
  featuredQuestions,
  recentQuestions,
  communityStats,
}: TrustedQuestionsClientProps) {
  const tree = QuestionsClient({
    todayQuestion,
    featuredQuestions,
    recentQuestions,
  });

  return sanitizeTree(tree, {
    hasToday: Boolean(todayQuestion),
    hasFeatured: featuredQuestions.length > 0,
    hasRecent: recentQuestions.length > 0,
    communityStats,
  });
}
