import { buildGoogleFontsHref } from "@/lib/templates/template-fonts";

interface TemplateFontLinksProps {
  headingFont?: string | null;
  bodyFont?: string | null;
  extraFonts?: Array<string | null | undefined>;
}

/** Server-safe Google Fonts link for template heading/body stacks. */
export function TemplateFontLinks({
  headingFont,
  bodyFont,
  extraFonts = [],
}: TemplateFontLinksProps) {
  const href = buildGoogleFontsHref([headingFont, bodyFont, ...extraFonts]);

  if (!href) return null;

  return <link rel="stylesheet" href={href} />;
}
