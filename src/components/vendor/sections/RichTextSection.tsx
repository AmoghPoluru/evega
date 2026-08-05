import type { SectionProps } from "./types";

/**
 * RichTextSection
 * A free-form heading + paragraph block. Text is rendered as plain paragraphs
 * (split on blank lines) so vendor-authored content can never inject markup.
 */
export function RichTextSection({ settings }: SectionProps) {
  const heading = typeof settings.heading === "string" ? settings.heading : "";
  const body = typeof settings.body === "string" ? settings.body : "";
  const align = settings.align === "center" || settings.align === "right" ? settings.align : "left";

  if (!heading && !body) {
    return null;
  }

  const paragraphs = body.split(/\n{2,}/).filter(Boolean);

  return (
    <div
      className="container mx-auto px-4 py-8 vendor-main-container"
      style={{
        maxWidth: "var(--template-container-width)",
        padding: "var(--template-spacing-section)",
        textAlign: align,
      }}
    >
      {heading && (
        <h2
          className="text-2xl font-bold mb-4"
          style={{
            color: "var(--template-text)",
            fontFamily: "var(--template-font-heading)",
          }}
        >
          {heading}
        </h2>
      )}
      {paragraphs.map((paragraph, index) => (
        <p
          key={index}
          className="mb-3 whitespace-pre-line"
          style={{
            color: "var(--template-text-secondary)",
            fontFamily: "var(--template-font-body)",
          }}
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}
