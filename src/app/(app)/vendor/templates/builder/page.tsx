"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { ArrowLeft, Loader2, Save, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getCategoryStarterConfig,
  type TemplateCategory,
} from "@/lib/templates/category-presets";
import {
  buildInitialStateFromTemplate,
  mergeBuilderConfig,
} from "@/lib/templates/builder-state";
import {
  normalizeBackgroundStyleType,
  resolveBackgroundTreatment,
} from "@/lib/templates/background-style-treatments";
import { toPickerHex } from "@/lib/color-utils";
import { gridLayoutToSkeleton } from "@/lib/templates/product-grid-layouts";
import type { TemplateConfig, TemplateCustomization } from "@/types/template-customization";
import {
  DEFAULT_SECTIONS,
  type StorefrontSection,
} from "@/types/template-sections";
import {
  buildInitialStateFromManifest,
  builderFormDefaultsFromConfig,
  getBuilderThemeStarter,
  resolveBackgroundStyleFromManifest,
} from "@/lib/templates/builder-theme-starters";
import { BuilderNav } from "./components/BuilderNav";
import { BuilderPreview } from "./components/BuilderPreview";
import { BuilderStarterGate } from "./components/BuilderStarterGate";
import { BuilderStarterSheet } from "./components/BuilderStarterSheet";
import { ExportThemeSpecButton } from "./components/ExportThemeSpecButton";
import {
  BACKGROUND_STYLE_OPTIONS,
  type BuilderPanelId,
} from "./components/builder-panels";
import { BuilderSettingsPanel } from "./components/BuilderSettingsPanel";
import {
  applyHeroVariant,
  applyProductLayout,
  getHeroVariant,
  getProductLayoutVariant,
  heroVariantToComponentStyle,
  inferHeroVariantFromConfig,
  inferProductLayoutFromConfig,
} from "./components/builder-section-utils";

type BuilderMode = "create" | "update" | "edit";

type BackgroundStyleType = (typeof BACKGROUND_STYLE_OPTIONS)[number]["value"];

const BUILDER_PANEL_IDS: BuilderPanelId[] = [
  "background",
  "layout",
  "typography",
  "chrome",
  "hero",
  "vendor",
];

function parseBuilderPanel(value: string | null): BuilderPanelId | null {
  if (!value) return null;
  return BUILDER_PANEL_IDS.includes(value as BuilderPanelId) ? (value as BuilderPanelId) : null;
}

function TemplateBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sourceTemplateId = searchParams.get("source");
  const editTemplateId = searchParams.get("edit");
  const presetSlug = searchParams.get("preset");
  const panelParam = parseBuilderPanel(searchParams.get("panel"));
  const loadTemplateId = editTemplateId ?? sourceTemplateId;

  const loadMode: BuilderMode = editTemplateId ? "edit" : sourceTemplateId ? "update" : "create";
  const applyToStoreOnSave = useRef(loadMode !== "create");

  const [activePanel, setActivePanel] = useState<BuilderPanelId>(panelParam ?? "background");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TemplateCategory>("minimal");
  const [skeleton, setSkeleton] = useState<ReturnType<typeof gridLayoutToSkeleton>>("classic");
  const [backgroundStyleType, setBackgroundStyleType] = useState<BackgroundStyleType>("light-tint");
  const [sections, setSections] = useState<StorefrontSection[]>(() =>
    DEFAULT_SECTIONS.map((section) => ({ ...section })),
  );
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [baseConfig, setBaseConfig] = useState<TemplateConfig | null>(null);
  const [prefillReady, setPrefillReady] = useState(!loadTemplateId && !presetSlug);
  const [starterGateOpen, setStarterGateOpen] = useState(!loadTemplateId && !presetSlug);
  const [starterSheetOpen, setStarterSheetOpen] = useState(false);
  const [activeStarterSlug, setActiveStarterSlug] = useState<string | null>(presetSlug);

  const form = useForm<TemplateCustomization>({
    defaultValues: {},
  });

  const applyThemeStarter = useCallback(
    (slug: string) => {
      const manifest = getBuilderThemeStarter(slug);
      if (!manifest) {
        toast.error("Theme starter not found");
        return;
      }

      const initial = buildInitialStateFromManifest(manifest);
      setName(`${initial.name} Theme`);
      setDescription(initial.description);
      setCategory(initial.category);
      setBaseConfig(initial.baseConfig);
      setSkeleton(initial.skeleton);
      setActiveStarterSlug(slug);
      setBackgroundStyleType(resolveBackgroundStyleFromManifest(manifest));

      const heroVariant = inferHeroVariantFromConfig(initial.baseConfig, initial.sections);
      const productLayout = inferProductLayoutFromConfig(initial.baseConfig, initial.sections);
      let nextSections = applyHeroVariant(initial.sections, heroVariant);
      nextSections = applyProductLayout(nextSections, productLayout);
      setSections(nextSections);

      form.reset(builderFormDefaultsFromConfig(initial.baseConfig));
      setTemplateId(null);
      setStarterGateOpen(false);
      setPrefillReady(true);

      if (initial.baseConfig.chrome?.enabled) {
        setActivePanel("chrome");
      } else if (heroVariant === "carousel-peek") {
        setActivePanel("hero");
      }

      toast.success(`Loaded ${initial.name} — customize colors, chrome, and typography in the panels.`);
    },
    [form],
  );

  const handleStartBlank = useCallback(() => {
    setStarterGateOpen(false);
    setPrefillReady(true);
    setActiveStarterSlug(null);
    setBaseConfig(null);
    setName("Untitled Theme");
    setDescription("");
    setCategory("minimal");
    setSkeleton("classic");
    setBackgroundStyleType("light-tint");
    setSections(DEFAULT_SECTIONS.map((section) => ({ ...section })));
    form.reset({});
    setTemplateId(null);
  }, [form]);

  useEffect(() => {
    if (panelParam) {
      setActivePanel(panelParam);
    }
  }, [panelParam]);

  useEffect(() => {
    if (!presetSlug || loadTemplateId) return;
    applyThemeStarter(presetSlug);
  }, [presetSlug, loadTemplateId, applyThemeStarter]);

  const { data: loadedTemplate, isLoading: isLoadingTemplate } =
    trpc.vendor.templates.getForBuilder.useQuery(
      { templateId: loadTemplateId ?? "" },
      { enabled: Boolean(loadTemplateId) },
    );

  const { data: vendorProfile } = trpc.vendor.dashboard.getMarketingProfile.useQuery();

  useEffect(() => {
    if (!loadedTemplate) return;

    const initial = buildInitialStateFromTemplate(loadedTemplate, {
      isOwned: loadedTemplate.isOwned,
    });

    setName(initial.name);
    setDescription(initial.description);
    setCategory(initial.category);
    setBaseConfig(initial.baseConfig);
    setSkeleton(initial.skeleton);
    setBackgroundStyleType(
      normalizeBackgroundStyleType(initial.baseConfig.backgroundStyle?.type),
    );

    const seedFromTemplate =
      initial.baseConfig.backgroundStyle?.value ??
      initial.baseConfig.colors.primary;

    const heroVariant = inferHeroVariantFromConfig(initial.baseConfig, initial.sections);
    const productLayout = inferProductLayoutFromConfig(initial.baseConfig, initial.sections);
    let nextSections = applyHeroVariant(initial.sections, heroVariant);
    nextSections = applyProductLayout(nextSections, productLayout);
    setSections(nextSections);

    setTemplateId(initial.templateId);
    form.reset({
      colors: { background: toPickerHex(seedFromTemplate, initial.baseConfig.colors.primary) },
      fonts: {
        heading: initial.baseConfig.fonts?.heading,
        body: initial.baseConfig.fonts?.body,
      },
      typography: initial.baseConfig.typography ?? {},
      chrome: initial.baseConfig.chrome,
    });
    setPrefillReady(true);
  }, [loadedTemplate, form]);

  const colorOverrides = useWatch({ control: form.control, name: "colors" });
  const fontOverrides = useWatch({ control: form.control, name: "fonts" });
  const typographyOverrides = useWatch({ control: form.control, name: "typography" });
  const chromeOverrides = useWatch({ control: form.control, name: "chrome" });

  const categoryStarter = useMemo(
    () => getCategoryStarterConfig(category),
    [category],
  );

  const effectiveBase = baseConfig ?? categoryStarter;

  const heroVariant = useMemo(() => getHeroVariant(sections), [sections]);
  const productLayout = useMemo(() => getProductLayoutVariant(sections), [sections]);

  useEffect(() => {
    setSkeleton(gridLayoutToSkeleton(productLayout));
  }, [productLayout]);

  const config = useMemo<TemplateConfig>(() => {
    const merged = mergeBuilderConfig(
      effectiveBase,
      { colors: colorOverrides, fonts: fontOverrides, typography: typographyOverrides, chrome: chromeOverrides },
      sections,
    );

    const seedColor = toPickerHex(
      colorOverrides?.background ?? merged.backgroundStyle?.value ?? merged.colors.primary,
      merged.colors.primary,
    );

    const treatment = resolveBackgroundTreatment(seedColor, backgroundStyleType);
    const heroStyle = heroVariantToComponentStyle(heroVariant);

    return {
      ...merged,
      colors: {
        ...merged.colors,
        primary: treatment.primary,
        secondary: treatment.secondary,
        accent: treatment.accent,
        background: treatment.backgroundColor,
        text: treatment.text,
        textSecondary: treatment.textSecondary,
        border: treatment.border,
        cardBackground: treatment.cardBackground,
      },
      backgroundStyle: {
        ...merged.backgroundStyle,
        type: backgroundStyleType,
        value: seedColor,
        animation: {
          enabled: treatment.needsMeshAnimation,
          duration: "15s",
          easing: "ease",
        },
      },
      components: {
        ...merged.components,
        heroBanner: {
          enabled: true,
          ...merged.components?.heroBanner,
          style: heroStyle,
        },
      },
    };
  }, [
    effectiveBase,
    colorOverrides,
    fontOverrides,
    typographyOverrides,
    chromeOverrides,
    sections,
    backgroundStyleType,
    heroVariant,
  ]);

  const createTemplate = trpc.vendor.templates.create.useMutation();
  const updateTemplate = trpc.vendor.templates.update.useMutation();
  const selectTemplate = trpc.vendor.templates.select.useMutation();
  const submitForApproval = trpc.vendor.templates.submitForApproval.useMutation();

  const isSaving =
    createTemplate.isPending || updateTemplate.isPending || selectTemplate.isPending;

  const persist = async (): Promise<string | null> => {
    if (name.trim().length < 2) {
      toast.error("Give your template a name first");
      return null;
    }

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      category,
      skeleton: gridLayoutToSkeleton(productLayout),
      templateConfig: config,
    };

    if (templateId) {
      await updateTemplate.mutateAsync({ ...payload, templateId });
      return templateId;
    }

    const created = await createTemplate.mutateAsync(payload);
    setTemplateId(created.id);
    return created.id;
  };

  const handleSave = async () => {
    try {
      const id = await persist();
      if (!id) return;

      if (applyToStoreOnSave.current) {
        await selectTemplate.mutateAsync({ templateId: id });
      }

      toast.success(
        applyToStoreOnSave.current
          ? "Template updated and applied to your storefront"
          : "Template saved",
      );
      router.push("/vendor/templates");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save template");
    }
  };

  const handleSubmitForApproval = async () => {
    try {
      const id = await persist();
      if (!id) return;
      await submitForApproval.mutateAsync({ templateId: id });
      toast.success("Submitted for approval");
      router.push("/vendor/templates");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit template");
    }
  };

  const pageTitle =
    loadMode === "update" ? "Update Template" : loadMode === "edit" ? "Edit Template" : "Create Template";

  if (starterGateOpen && !loadTemplateId) {
    return (
      <BuilderStarterGate
        onSelect={applyThemeStarter}
        onStartBlank={handleStartBlank}
      />
    );
  }

  if (loadTemplateId && (isLoadingTemplate || !prefillReady)) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[calc(100vh-8rem)] w-full" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border bg-background px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="-ml-2 shrink-0">
            <Link href="/vendor/templates">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-foreground">{pageTitle}</h1>
          </div>
          <Input
            className="max-w-xs"
            placeholder="Template name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="flex shrink-0 gap-2">
          <ExportThemeSpecButton
            name={name}
            description={description}
            category={category}
            skeleton={skeleton}
            config={config}
            sections={sections}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStarterSheetOpen(true)}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Theme starters
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSubmitForApproval}
            disabled={isSaving || submitForApproval.isPending}
          >
            {submitForApproval.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Submit for approval
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {loadMode === "create" ? "Save template" : "Save & apply"}
          </Button>
        </div>
      </header>

      <BuilderStarterSheet
        open={starterSheetOpen}
        onOpenChange={setStarterSheetOpen}
        onSelectStarter={applyThemeStarter}
        onStartBlank={loadTemplateId ? undefined : handleStartBlank}
        activeSlug={activeStarterSlug}
      />

      <div className="flex min-h-0 flex-1">
        <BuilderNav active={activePanel} onChange={setActivePanel} />

        <BuilderSettingsPanel
          activePanel={activePanel}
          form={form}
          baseColors={effectiveBase.colors}
          baseFonts={effectiveBase.fonts}
          baseTypography={effectiveBase.typography}
          baseChrome={effectiveBase.chrome}
          backgroundStyleType={backgroundStyleType}
          onBackgroundStyleTypeChange={setBackgroundStyleType}
          gridLayout={productLayout}
          onGridLayoutChange={(layout) =>
            setSections((current) => applyProductLayout(current, layout))
          }
          heroVariant={heroVariant}
          onHeroVariantChange={(variant) => setSections((current) => applyHeroVariant(current, variant))}
          sections={sections}
          onSectionsChange={setSections}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-muted/30">
          <div className="border-b border-border px-4 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Live preview
            </p>
          </div>
          <div className="min-h-0 flex-1 p-4">
            <BuilderPreview
              config={config}
              sections={sections}
              vendorName={vendorProfile?.name ?? name}
              vendorSlug={vendorProfile?.slug}
              vendorEmail={vendorProfile?.email}
              vendorPhone={vendorProfile?.phone}
              vendorWebsite={vendorProfile?.website}
              category={category}
              skeleton={skeleton}
              className="h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TemplateBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-[calc(100vh-8rem)] w-full" />
        </div>
      }
    >
      <TemplateBuilderContent />
    </Suspense>
  );
}
