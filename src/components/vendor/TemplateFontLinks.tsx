import { buildGoogleFontsHref } from "@/lib/templates/template-fonts";

interface TemplateFontLinksProps {
  headingFont?: string | null;
  bodyFont?: string | null;
}

/** Server-safe Google Fonts link for template heading/body stacks. */
export function TemplateFontLinks({ headingFont, bodyFont }: TemplateFontLinksProps) {
  const href = buildGoogleFontsHref([headingFont, bodyFont]);

  if (!href) return null;

  return <link rel="stylesheet" href={href} />;
}
