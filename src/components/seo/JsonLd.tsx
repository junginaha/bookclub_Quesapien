/**
 * JsonLd — injects a JSON-LD <script> tag for Schema.org structured data.
 * Server-renderable (no "use client"). Works inside Next.js <head> or <body>.
 */
export function JsonLd({ data }: { data: object | null | undefined }) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
