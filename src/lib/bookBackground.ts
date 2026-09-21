import { CHAT_MODEL, isOpenRouter } from "@/lib/anthropic";
import type { BookEvidence } from "@/lib/bookEvidence";

export interface BackgroundSource {
  title: string;
  url: string;
  domain: string;
}

export interface BookBackground {
  fact: string;
  category:
    | "writing"
    | "publication"
    | "reception"
    | "censorship"
    | "translation"
    | "author_context"
    | "adaptation"
    | "bibliographic";
  whyItMatters: string;
  questionSeed: string;
  confidence: "cross_checked" | "bibliographic_cross_check";
  sources: BackgroundSource[];
}

type WebCitation = {
  type?: string;
  url?: string;
  title?: string;
  cited_text?: string;
};

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function extractJson<T>(text: string): T | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as T;
  } catch {
    return null;
  }
}

async function researchWithAnthropicWebSearch(
  evidence: BookEvidence
): Promise<BookBackground | null> {
  const key = process.env.ANTHROPIC_API_KEY ?? "";
  if (!key || isOpenRouter) return null;

  const prompt = [
    "당신은 북클럽의 '아카이브 편집자'입니다.",
    "목표는 책의 내용을 요약하는 것이 아니라, 독자가 흔히 놓치는 집필·출간·편집·검열·번역·수용·저자 상황 같은 숨은 배경을 실제 웹에서 찾아 검증하는 것입니다.",
    "",
    "[대상 책]",
    "제목: " + evidence.title,
    "저자: " + evidence.authors.join(", "),
    evidence.publisher ? "출판사/판본 정보: " + evidence.publisher : "",
    evidence.publishedDate ? "확인된 출간일: " + evidence.publishedDate : "",
    evidence.firstPublishYear ? "확인된 초판연도: " + evidence.firstPublishYear : "",
    evidence.isbn13 ? "ISBN-13: " + evidence.isbn13 : "",
    "",
    "반드시 웹 검색을 사용하세요. 다음 순서로 조사하세요.",
    "1. 책 제목+저자로 출간/집필 배경, 저자 인터뷰, 출판사 소개, 문학사·미술관·대학·도서관·신문 아카이브를 검색합니다.",
    "2. 흥미롭지만 덜 알려진 사실 후보를 찾습니다.",
    "3. 같은 사실을 서로 다른 도메인의 독립된 출처 2곳 이상에서 확인합니다. 가능하면 출판사·저자 인터뷰·도서관·박물관·대학·신문 원문을 우선합니다.",
    "4. 두 출처에서 확인되지 않은 비화는 버립니다.",
    "5. 직접 인용은 하지 말고 사실을 짧게 요약합니다.",
    "6. 책의 질문으로 이어질 수 있는 이유와 질문 씨앗을 만듭니다.",
    "",
    "최종 답변은 아래 JSON 하나만 반환하세요.",
    '{"fact":"검증된 숨은 배경 1개","category":"writing|publication|reception|censorship|translation|author_context|adaptation","whyItMatters":"이 배경을 알고 읽으면 달라지는 지점","questionSeed":"이 배경에서 출발하는 북토크 질문"}',
    "",
    "검색 결과가 부족해 2개 독립 출처로 확인할 수 없다면 정확히 {"fact":"","category":"publication","whyItMatters":"","questionSeed":""} 를 반환하세요.",
  ].filter(Boolean).join("\n");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      max_tokens: 1800,
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 5,
        },
      ],
    }),
  }).catch(() => null);

  if (!response?.ok) return null;
  const data = await response.json().catch(() => null) as {
    content?: Array<{
      type?: string;
      text?: string;
      citations?: WebCitation[];
    }>;
  } | null;
  if (!data?.content) return null;

  const text = data.content
    .filter((block) => block.type === "text" && block.text)
    .map((block) => block.text)
    .join("\n");

  const parsed = extractJson<{
    fact?: string;
    category?: BookBackground["category"];
    whyItMatters?: string;
    questionSeed?: string;
  }>(text);

  if (!parsed?.fact?.trim() || !parsed.whyItMatters?.trim() || !parsed.questionSeed?.trim()) {
    return null;
  }

  const citations = data.content
    .flatMap((block) => block.citations ?? [])
    .filter((citation) => citation.type === "web_search_result_location" && citation.url);

  const unique = new Map<string, BackgroundSource>();
  for (const citation of citations) {
    if (!citation.url) continue;
    const domain = domainOf(citation.url);
    if (!domain || unique.has(domain)) continue;
    unique.set(domain, {
      title: citation.title || domain,
      url: citation.url,
      domain,
    });
  }

  const sources = Array.from(unique.values());
  if (sources.length < 2) return null;

  return {
    fact: parsed.fact.trim(),
    category: parsed.category || "publication",
    whyItMatters: parsed.whyItMatters.trim(),
    questionSeed: parsed.questionSeed.trim(),
    confidence: "cross_checked",
    sources: sources.slice(0, 4),
  };
}

function bibliographicFallback(evidence: BookEvidence): BookBackground | null {
  const google = evidence.sources.find((source) => source.provider === "Google Books");
  const open = evidence.sources.find((source) => source.provider === "Open Library");
  if (!google || !open) return null;

  const publicationBits: string[] = [];
  if (evidence.firstPublishYear) {
    publicationBits.push("Open Library의 Work 데이터는 초판연도를 " + evidence.firstPublishYear + "년으로 기록합니다.");
  }
  if (evidence.publishedDate) {
    publicationBits.push("Google Books에 확인된 판본의 출간 표기는 " + evidence.publishedDate + "입니다.");
  }
  if (!publicationBits.length) return null;

  const editionContrast =
    evidence.firstPublishYear &&
    evidence.publishedDate &&
    !evidence.publishedDate.startsWith(String(evidence.firstPublishYear));

  return {
    fact: editionContrast
      ? publicationBits.join(" ") + " 즉, 지금 검색되는 판본 정보와 작품의 최초 출간 시점을 구분해 읽어야 합니다."
      : publicationBits.join(" "),
    category: "bibliographic",
    whyItMatters: editionContrast
      ? "초판과 현재 유통 판본을 구분하면 번역·편집·시대적 맥락을 같은 것으로 착각하는 일을 피할 수 있습니다."
      : "작품의 출간 시점을 먼저 확인하면 책이 나온 시대와 지금의 독서 환경을 분리해 질문할 수 있습니다.",
    questionSeed: editionContrast
      ? "초판이 나온 시대와 지금 읽는 판본의 시대 차이가 이 책을 이해하는 방식에 어떤 영향을 줄까요?"
      : "이 책이 처음 나온 시기를 알고 읽을 때, 지금의 독자가 다르게 보게 되는 문제는 무엇일까요?",
    confidence: "bibliographic_cross_check",
    sources: [
      { title: google.label, url: google.url, domain: domainOf(google.url) || "books.google.com" },
      { title: open.label, url: open.url, domain: domainOf(open.url) || "openlibrary.org" },
    ],
  };
}

export async function researchBookBackground(
  evidence: BookEvidence
): Promise<BookBackground | null> {
  const searched = await researchWithAnthropicWebSearch(evidence);
  if (searched) return searched;
  return bibliographicFallback(evidence);
}

export function backgroundForPrompt(background: BookBackground): string {
  return [
    "검증된 숨은 배경: " + background.fact,
    "분류: " + background.category,
    "왜 중요한가: " + background.whyItMatters,
    "질문 씨앗: " + background.questionSeed,
    "검증 수준: " + background.confidence,
    "출처: " + background.sources.map((source) => source.title + " <" + source.url + ">").join(" / "),
  ].join("\n");
}
