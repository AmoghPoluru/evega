"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { ArrowLeft, Loader2, Plus, Save, Send } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  getCategoryStarterConfig,
  mergeCategoryWithCustomization,
  type TemplateCategory,
} from "@/lib/templates/category-presets";
import type { TemplateConfig, TemplateCustomization } from "@/types/template-customization";
import {
  DEFAULT_SECTIONS,
  SECTION_LABELS,
  createDefaultSection,
  type StorefrontSection,
  type StorefrontSectionType,
} from "@/types/template-sections";
import { ColorPicker } from "../customize/components/ColorPicker";
import { FontSelector } from "../customize/components/FontSelector";
import { BuilderPreview } from "./components/BuilderPreview";
import { SectionList } from "./components/SectionList";

const CATEGORIES = [
  { value: "minimal", label: "Minimal" },
  { value: "elegant", label: "Elegant" },
  { value: "bold", label: "Bold" },
  { value: "colorful", label: "Colorful" },
  { value: "classic", label: "Classic" },
] as const satisfies ReadonlyArray<{ value: TemplateCategory; label: string }>;

const SECTION_TYPES = Object.keys(SECTION_LABELS) as StorefrontSectionType[];

export default function TemplateBuilderPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TemplateCategory>("minimal");
  const [sections, setSections] = useState<StorefrontSection[]>(() =>
    DEFAULT_SECTIONS.map((section) => ({ ...section })),
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState<string | null>(null);

  const form = useForm<TemplateCustomization>({
    defaultValues: {},
  });

  const colorOverrides = useWatch({ control: form.control, name: "colors" });
  const fontOverrides = useWatch({ control: form.control, name: "fonts" });
  const categoryStarter = useMemo(
    () => getCategoryStarterConfig(category),
    [category],
  );

  const config = useMemo<TemplateConfig>(
    () =>
      mergeCategoryWithCustomization(
        category,
        { colors: colorOverrides, fonts: fontOverrides },
        sections,
      ),
    [category, colorOverrides, fontOverrides, sections],
  );

  const handleCategoryChange = (value: TemplateCategory) => {
    setCategory(value);
    form.reset({});
  };

  const createTemplate = trpc.vendor.templates.create.useMutation();
  const updateTemplate = trpc.vendor.templates.update.useMutation();
  const submitForApproval = trpc.vendor.templates.submitForApproval.useMutation();

  const isSaving = createTemplate.isPending || updateTemplate.isPending;

  const addSection = (type: StorefrontSectionType) => {
    const section = createDefaultSection(type, sections.length);
    setSections((current) => [...current, section]);
    setExpandedId(section.id);
  };

  const persist = async (): Promise<string | null> => {
    if (name.trim().length < 2) {
      toast.error("Give your template a name first");
      return null;
    }

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      category,
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
      toast.success("Template saved");
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

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
            <Link href="/vendor/templates">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to templates
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">Create Template</h1>
          <p className="text-sm text-gray-600 mt-1">
            Compose your storefront from sections, then save it as your own template.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSubmitForApproval}
            disabled={isSaving || submitForApproval.isPending}
          >
            {submitForApproval.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Submit for global approval
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,340px)_minmax(0,1fr)_minmax(0,320px)]">
        {/* Sections */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Template details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Name</Label>
                <Input
                  placeholder="My storefront"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Category</Label>
                <Select
                  value={category}
                  onValueChange={(value) => handleCategoryChange(value as TemplateCategory)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <Textarea
                  rows={3}
                  placeholder="What makes this template a good fit?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <SectionList
                sections={sections}
                expandedId={expandedId}
                onToggleExpanded={(id) => setExpandedId((current) => (current === id ? null : id))}
                onChange={setSections}
              />

              <div className="flex flex-wrap gap-2 pt-2">
                {SECTION_TYPES.map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addSection(type)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {SECTION_LABELS[type]}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live preview */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Live preview</CardTitle>
            </CardHeader>
            <CardContent>
              <BuilderPreview
                config={config}
                sections={sections}
                vendorName={name}
                category={category}
              />
            </CardContent>
          </Card>
        </div>

        {/* Global styling */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Typography</CardTitle>
            </CardHeader>
            <CardContent>
              <FontSelector form={form} baseFonts={categoryStarter.fonts} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Colors</CardTitle>
            </CardHeader>
            <CardContent>
              <ColorPicker form={form} baseColors={categoryStarter.colors} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
