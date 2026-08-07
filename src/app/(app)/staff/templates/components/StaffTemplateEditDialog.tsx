"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type TemplateCategory = "minimal" | "elegant" | "bold" | "colorful" | "classic";

type TemplateDraft = {
  slug: string;
  name: string;
  description: string;
  category: TemplateCategory;
  version: string;
  author: string;
  isDefault: boolean;
  isActive: boolean;
  templateConfigJson: string;
  cssVariablesJson: string;
  componentMappingJson: string;
};

interface Props {
  templateId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

function emptyDraft(): TemplateDraft {
  return {
    slug: "",
    name: "",
    description: "",
    category: "minimal",
    version: "1.0.0",
    author: "",
    isDefault: false,
    isActive: true,
    templateConfigJson: "{}",
    cssVariablesJson: "{}",
    componentMappingJson: "{}",
  };
}

function stringifyJson(value: unknown, fallback = "{}"): string {
  try {
    return JSON.stringify(value ?? JSON.parse(fallback), null, 2);
  } catch {
    return fallback;
  }
}

function parseJsonField(label: string, raw: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error(`${label} must be a JSON object`);
    }
    return parsed as Record<string, unknown>;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON";
    throw new Error(`${label}: ${message}`);
  }
}

function isTemplateCategory(value: string): value is TemplateCategory {
  return ["minimal", "elegant", "bold", "colorful", "classic"].includes(value);
}

function StaffTemplateEditDialogInner({
  templateId,
  open,
  onOpenChange,
  onSaved,
}: {
  templateId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<TemplateDraft>(emptyDraft);
  const [isDraftReady, setIsDraftReady] = useState(false);

  const { data: template, isLoading, error, isFetching } = trpc.admin.templates.getOne.useQuery(
    { id: templateId },
    { enabled: open, retry: 1 },
  );

  const utils = trpc.useUtils();

  const updateTemplate = trpc.admin.templates.update.useMutation({
    onSuccess: (_data, variables) => {
      toast.success("Template updated");
      void utils.admin.templates.getOne.invalidate({ id: variables.id });
      onSaved();
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update template");
    },
  });

  useEffect(() => {
    if (!template || template.id !== templateId) {
      setIsDraftReady(false);
      return;
    }

    setDraft({
      slug: template.slug,
      name: template.name,
      description: template.description,
      category: isTemplateCategory(template.category) ? template.category : "minimal",
      version: template.version,
      author: template.author,
      isDefault: template.isDefault,
      isActive: template.isActive,
      templateConfigJson: stringifyJson(template.templateConfig),
      cssVariablesJson: stringifyJson(template.cssVariables),
      componentMappingJson: stringifyJson(template.componentMapping),
    });
    setIsDraftReady(true);
  }, [template, templateId]);

  const handleSave = () => {
    if (!isDraftReady) return;

    if (!draft.name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      updateTemplate.mutate({
        id: templateId,
        name: draft.name.trim(),
        description: draft.description.trim() || null,
        category: draft.category,
        version: draft.version.trim() || "1.0.0",
        author: draft.author.trim(),
        isDefault: draft.isDefault,
        isActive: draft.isActive,
        templateConfig: parseJsonField("Template config", draft.templateConfigJson),
        cssVariables: parseJsonField("CSS variables", draft.cssVariablesJson),
        componentMapping: parseJsonField("Component mapping", draft.componentMappingJson),
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid JSON");
    }
  };

  const showLoading = isLoading || (isFetching && !isDraftReady);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit template</DialogTitle>
          <DialogDescription>
            Update metadata and JSON configuration. Slug is read-only after creation.
          </DialogDescription>
        </DialogHeader>

        {showLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading template…
          </div>
        ) : error ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error.message}
          </div>
        ) : isDraftReady ? (
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="config">Configuration</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Name</Label>
                  <Input
                    id="template-name"
                    value={draft.name}
                    onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input value={draft.slug} disabled className="font-mono text-sm" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-description">Description</Label>
                <Textarea
                  id="template-description"
                  rows={3}
                  value={draft.description}
                  onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={draft.category}
                    onValueChange={(v) =>
                      setDraft((d) => ({ ...d, category: v as TemplateCategory }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[100]">
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="elegant">Elegant</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                      <SelectItem value="colorful">Colorful</SelectItem>
                      <SelectItem value="classic">Classic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-version">Version</Label>
                  <Input
                    id="template-version"
                    value={draft.version}
                    onChange={(e) => setDraft((d) => ({ ...d, version: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-author">Author</Label>
                  <Input
                    id="template-author"
                    value={draft.author}
                    onChange={(e) => setDraft((d) => ({ ...d, author: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={draft.isActive}
                    onCheckedChange={(checked) =>
                      setDraft((d) => ({ ...d, isActive: checked === true }))
                    }
                  />
                  Active (visible to vendors)
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={draft.isDefault}
                    onCheckedChange={(checked) =>
                      setDraft((d) => ({ ...d, isDefault: checked === true }))
                    }
                  />
                  Site-wide default for new vendors
                </label>
              </div>
            </TabsContent>

            <TabsContent value="config" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template-config">templateConfig (JSON)</Label>
                <Textarea
                  id="template-config"
                  rows={8}
                  className="font-mono text-xs"
                  value={draft.templateConfigJson}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, templateConfigJson: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="css-variables">cssVariables (JSON)</Label>
                <Textarea
                  id="css-variables"
                  rows={6}
                  className="font-mono text-xs"
                  value={draft.cssVariablesJson}
                  onChange={(e) => setDraft((d) => ({ ...d, cssVariablesJson: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="component-mapping">componentMapping (JSON)</Label>
                <Textarea
                  id="component-mapping"
                  rows={6}
                  className="font-mono text-xs"
                  value={draft.componentMappingJson}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, componentMappingJson: e.target.value }))
                  }
                />
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Template data could not be loaded. Close and try again.
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!isDraftReady || updateTemplate.isPending}
            onClick={handleSave}
          >
            {updateTemplate.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function StaffTemplateEditDialog({ templateId, open, onOpenChange, onSaved }: Props) {
  if (!open || !templateId) return null;

  return (
    <StaffTemplateEditDialogInner
      key={templateId}
      templateId={templateId}
      open={open}
      onOpenChange={onOpenChange}
      onSaved={onSaved}
    />
  );
}
