/**
 * DefinitionBlock — AI 크롤러 전용 페이지 정의.
 * 인간에게는 보이지 않고(clip 방식), AI 크롤러는 읽음.
 */

interface DefinitionBlockProps {
  definition: string;
  entityType?: string;
}

export default function DefinitionBlock({ definition, entityType }: DefinitionBlockProps) {
  return (
    <div
      aria-label="페이지 정의"
      data-entity-type={entityType}
      itemScope
      itemType="https://schema.org/DefinedTerm"
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
      <span itemProp="name">{entityType}</span>
      <p itemProp="description">{definition}</p>
    </div>
  );
}
