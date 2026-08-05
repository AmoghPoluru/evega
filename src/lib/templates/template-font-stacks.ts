import type { TemplateConfig } from "@/types/template-customization";

/** Collect every font-family stack referenced by a template config for Google Fonts loading. */
export function collectTemplateFontStacks(
  config: Pick<TemplateConfig, "fonts" | "typography" | "chrome">,
): string[] {
  const chromeTypo = config.chrome?.typography;
  const chromeFonts = chromeTypo
    ? [
        chromeTypo.wordmark?.font,
        chromeTypo.heroHeadline?.font,
        chromeTypo.sectionHeadline?.font,
        chromeTypo.navLinks?.font,
        chromeTypo.body?.font,
        chromeTypo.smallLabels?.font,
      ]
    : [];

  const stacks = [
    config.fonts?.heading,
    config.fonts?.body,
    config.typography?.vendor?.font,
    config.typography?.hero?.font,
    config.typography?.product?.font,
    config.typography?.price?.font,
    ...chromeFonts,
  ].filter((stack): stack is string => Boolean(stack));

  return [...new Set(stacks)];
}
