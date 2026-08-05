import type { SectionProps } from "./types";

interface Testimonial {
  quote?: string;
  author?: string;
  role?: string;
}

/**
 * TestimonialsSection
 * Renders vendor-authored customer quotes configured in the template builder.
 */
export function TestimonialsSection({ settings }: SectionProps) {
  const title = typeof settings.title === "string" ? settings.title : "What customers say";
  const testimonials = Array.isArray(settings.testimonials)
    ? (settings.testimonials as Testimonial[])
    : [];

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <div
      className="container mx-auto px-4 py-8 vendor-main-container"
      style={{
        maxWidth: "var(--template-container-width)",
        padding: "var(--template-spacing-section)",
      }}
    >
      {title && (
        <h2
          className="text-2xl font-bold mb-6"
          style={{
            color: "var(--template-text)",
            fontFamily: "var(--template-font-heading)",
          }}
        >
          {title}
        </h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <blockquote
            key={index}
            className="p-6 rounded-lg border"
            style={{
              backgroundColor: "var(--template-card-bg)",
              borderColor: "var(--template-border)",
              borderRadius: "var(--template-card-radius)",
            }}
          >
            <p
              className="text-base italic"
              style={{
                color: "var(--template-text)",
                fontFamily: "var(--template-font-body)",
              }}
            >
              “{testimonial.quote}”
            </p>
            {(testimonial.author || testimonial.role) && (
              <footer
                className="mt-4 text-sm"
                style={{ color: "var(--template-text-secondary)" }}
              >
                {testimonial.author}
                {testimonial.author && testimonial.role ? " — " : ""}
                {testimonial.role}
              </footer>
            )}
          </blockquote>
        ))}
      </div>
    </div>
  );
}
