import type { VendorTemplate } from "@/payload-types";
import { mergeTemplateWithCustomization } from "@/lib/templates/default-template";
import type { TemplateConfig, TemplateCustomization } from "@/types/template-customization";
import type { TemplateCategory } from "@/lib/templates/category-presets";
import type { StorefrontSkeleton } from "@/lib/templates/manifests/types";
import {
  DEFAULT_SECTIONS,
  normalizeStorefrontSections,
  type StorefrontSection,
} from "@/types/template-sections";

export interface BuilderInitialState {
  name: string;
  description: string;
  category: TemplateCategory;
  sections: StorefrontSection[];
  baseConfig: TemplateConfig;
  skeleton: StorefrontSkeleton;
  /** Vendor-owned template id when editing an existing draft. */
  templateId: string | null;
  /** True when prefilled from a global/catalog template (save creates a vendor-owned copy). */
  isForkFromCatalog: boolean;
}

function asTemplateConfig(value: unknown): TemplateConfig {
  return value as TemplateConfig;
}

function asSections(
  template: Pick<VendorTemplate, "sections" | "templateConfig">,
): StorefrontSection[] {
  const fromTopLevel = template.sections;
  if (Array.isArray(fromTopLevel) && fromTopLevel.length > 0) {
    return normalizeStorefrontSections(fromTopLevel as StorefrontSection[]);
  }

  const config = template.templateConfig as { sections?: StorefrontSection[] } | undefined;
  if (Array.isArray(config?.sections) && config.sections.length > 0) {
    return normalizeStorefrontSections(config.sections);
  }

  return DEFAULT_SECTIONS.map((section) => ({ ...section }));
}

/** Build builder form state from a vendor-template document. */
export function buildInitialStateFromTemplate(
  template: VendorTemplate,
  options?: { isOwned?: boolean },
): BuilderInitialState {
  const baseConfig = asTemplateConfig(template.templateConfig);
  const category = (template.category ?? "minimal") as TemplateCategory;
  const isOwned = options?.isOwned ?? Boolean(template.owner);

  const skeleton = (template.skeleton ?? "classic") as StorefrontSkeleton;

  return {
    name: template.name,
    description: template.description ?? "",
    category,
    sections: asSections(template),
    baseConfig,
    skeleton,
    templateId: isOwned ? template.id : null,
    isForkFromCatalog: !isOwned,
  };
}

/** Merge color/font overrides from the builder form onto a loaded base config. */
export function mergeBuilderConfig(
  baseConfig: TemplateConfig,
  overrides: TemplateCustomization,
  sections: StorefrontSection[],
): TemplateConfig {
  return mergeTemplateWithCustomization(baseConfig, {
    ...overrides,
    sections,
  });
}
