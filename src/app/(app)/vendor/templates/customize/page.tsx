"use client";

import { useEffect } from "react";
import { trpc } from "@/trpc/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { ColorPicker } from "./components/ColorPicker";
import { FontSelector } from "./components/FontSelector";
import { LayoutOptions } from "./components/LayoutOptions";
import { LivePreview } from "./components/LivePreview";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { templateCustomizationSchema } from "@/types/template-customization";
import type { TemplateCustomization } from "@/types/template-customization";
import { vendorPageTitles } from "@/lib/vendor-portal-labels";

export default function CustomizeTemplatePage() {
  const { data, isLoading } = trpc.vendor.templates.getCustomization.useQuery();
  const customizeMutation = trpc.vendor.templates.customize.useMutation({
    onSuccess: () => {
      toast.success("Customization saved successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save customization");
    },
  });

  const form = useForm<TemplateCustomization>({
    resolver: zodResolver(templateCustomizationSchema),
    defaultValues: {},
  });

  // Update form when data loads
  useEffect(() => {
    if (data?.customization) {
      form.reset(data.customization);
    }
  }, [data, form]);

  const handleSave = (values: TemplateCustomization) => {
    customizeMutation.mutate({ customization: values });
  };

  const handleReset = () => {
    if (data?.customization) {
      form.reset({});
      customizeMutation.mutate({ customization: {} });
      toast.success("Customization reset to template defaults");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-64 mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!data?.template) {
    return (
      <div className="p-6">
        <p className="text-gray-500">No template selected. Please select a template first.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{vendorPageTitles.customizeTemplate}</h1>
          <p className="text-sm text-gray-600 mt-1">
            Customize colors, fonts, and layout to match your brand
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Default
          </Button>
          <Button onClick={form.handleSubmit(handleSave)} disabled={customizeMutation.isPending}>
            {customizeMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customization Controls */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Customization Options</CardTitle>
              <CardDescription>
                Adjust your template settings below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="colors" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="colors">Colors</TabsTrigger>
                  <TabsTrigger value="fonts">Fonts</TabsTrigger>
                  <TabsTrigger value="layout">Layout</TabsTrigger>
                </TabsList>
                <TabsContent value="colors" className="space-y-4">
                  <ColorPicker form={form} />
                </TabsContent>
                <TabsContent value="fonts" className="space-y-4">
                  <FontSelector form={form} />
                </TabsContent>
                <TabsContent value="layout" className="space-y-4">
                  <LayoutOptions form={form} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>
                See your changes in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LivePreview
                template={data.template}
                customization={form.watch()}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
