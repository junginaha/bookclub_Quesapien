/**
 * AISummaryBlock — AI 검색엔진 전용 구조화 요약.
 * 인간에게는 보이지 않고(clip 방식), AI 크롤러(Perplexity, SearchGPT, Claude)는 읽음.
 * display:none 대신 clip을 사용해 DOM에 유지.
 */

interface AISummaryProps {
  what: string;
  why?: string;
  who: string;
  bullets?: string[];
}

export default function AISummaryBlock({ what, why, who, bullets }: AISummaryProps) {
  return (
    <aside
      aria-label="AI 요약"
      itemScope
      itemType="https://schema.org/WebPageElement"
      style={{
        position: "absolute",
        width: 1,
        height: 1,
        overflow: "hidden",
        clip: "rect(0,0,0,0)",
        whiteSpace: "nowrap",
        pointerEvents: "none",
      }}
    >
      <p itemProp="description"><strong>무엇인가:</strong> {what}</p>
      {why && <p itemProp="description"><strong>왜 중요한가:</strong> {why}</p>}
      <p itemProp="description"><strong>누구에게 적합한가:</strong> {who}</p>
      {bullets && (
        <ul>
          {bullets.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      )}
    </aside>
  );
}
