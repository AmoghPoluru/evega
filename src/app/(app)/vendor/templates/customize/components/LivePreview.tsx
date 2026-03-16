"use client";

import { useEffect, useState } from "react";
import { generateCSSVariables, cssVariablesToString } from "@/lib/templates/css-variables";
import type { ResolvedTemplate, TemplateCustomization } from "@/types/template-customization";

interface LivePreviewProps {
  template: ResolvedTemplate;
  customization: TemplateCustomization;
}

export function LivePreview({ template, customization }: LivePreviewProps) {
  const [cssVariables, setCSSVariables] = useState<Record<string, string>>({});

  useEffect(() => {
    // Merge template config with customization for preview
    const mergedConfig = {
      ...template.templateConfig,
      colors: {
        ...template.templateConfig.colors,
        ...customization.colors,
      },
      fonts: {
        ...template.templateConfig.fonts,
        ...customization.fonts,
      },
      spacing: {
        ...template.templateConfig.spacing,
        ...customization.spacing,
      },
      layout: {
        ...template.templateConfig.layout,
        ...customization.layout,
      },
      components: {
        heroBanner: {
          ...template.templateConfig.components.heroBanner,
          ...customization.components?.heroBanner,
        },
        productCard: {
          ...template.templateConfig.components.productCard,
          ...customization.components?.productCard,
        },
        navigation: {
          ...template.templateConfig.components.navigation,
          ...customization.components?.navigation,
        },
      },
    };
    
    // Generate CSS variables from merged config
    const variables = generateCSSVariables(mergedConfig);
    setCSSVariables(variables);
  }, [template, customization]);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div
        className="p-8 min-h-[400px]"
        style={cssVariables as React.CSSProperties}
      >
        <style>{`
          :root {
            ${cssVariablesToString(cssVariables)}
          }
        `}</style>
        
        {/* Preview Content */}
        <div className="space-y-6">
          <div>
            <h1
              style={{
                fontFamily: "var(--template-font-heading)",
                color: "var(--template-text)",
              }}
              className="text-3xl font-bold mb-2"
            >
              Sample Heading
            </h1>
            <p
              style={{
                fontFamily: "var(--template-font-body)",
                color: "var(--template-text-secondary)",
              }}
              className="text-base"
            >
              This is a preview of how your template will look with the current customizations.
            </p>
          </div>

          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: "var(--template-card-bg)",
              border: "1px solid var(--template-border)",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--template-font-heading)",
                color: "var(--template-text)",
              }}
              className="text-xl font-semibold mb-2"
            >
              Sample Product Card
            </h2>
            <p
              style={{
                fontFamily: "var(--template-font-body)",
                color: "var(--template-text-secondary)",
              }}
              className="text-sm mb-3"
            >
              Product description goes here
            </p>
            <div
              className="inline-block px-4 py-2 rounded text-white font-medium"
              style={{
                backgroundColor: "var(--template-primary)",
              }}
            >
              $99.99
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className="px-4 py-2 rounded text-white font-medium"
              style={{
                backgroundColor: "var(--template-primary)",
              }}
            >
              Primary Button
            </button>
            <button
              className="px-4 py-2 rounded font-medium"
              style={{
                backgroundColor: "var(--template-secondary)",
                color: "white",
              }}
            >
              Secondary Button
            </button>
            <button
              className="px-4 py-2 rounded font-medium"
              style={{
                backgroundColor: "var(--template-accent)",
                color: "white",
              }}
            >
              Accent Button
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
