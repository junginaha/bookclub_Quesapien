/**
 * JsonLd — injects JSON-LD <script> tags for Schema.org structured data.
 * Accepts a single object or an array of objects (multi-schema support).
 * Server-renderable (no "use client").
 */
export function JsonLd({ data }: { data: object | object[] | null | undefined }) {
  if (!data) return null;
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
