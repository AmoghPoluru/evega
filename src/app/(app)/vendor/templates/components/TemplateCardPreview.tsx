"use client";

import { useState } from "react";
import type { VendorTemplate } from "@/payload-types";
import {
  getTemplateCardPreviewStyle,
  getTemplateThumbnailUrl,
} from "@/lib/templates/template-thumbnail";

type TemplateListItem = VendorTemplate & { isSelected?: boolean; thumbnailUrl?: string | null };

type TemplateCardPreviewProps = {
  template: TemplateListItem;
};

function TemplateGradientPreview({ template }: TemplateCardPreviewProps) {
  const style = getTemplateCardPreviewStyle(template);

  return (
    <div
      className="flex h-48 w-full flex-col items-center justify-center px-4 text-center"
      style={style}
    >
      <span className="text-base font-semibold drop-shadow-sm">{template.name}</span>
      <span className="mt-1 text-xs uppercase tracking-wider opacity-90">{template.category}</span>
      <span className="mt-3 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
        Theme preview
      </span>
    </div>
  );
}

export function TemplateCardPreview({ template }: TemplateCardPreviewProps) {
  const thumbnailUrl = template.thumbnailUrl ?? getTemplateThumbnailUrl(template);
  const [imageFailed, setImageFailed] = useState(false);

  if (thumbnailUrl && !imageFailed) {
    return (
      <img
        src={thumbnailUrl}
        alt={`${template.name} preview`}
        className="h-48 w-full object-cover object-top"
        loading="lazy"
        onError={() => setImageFailed(true)}
      />
    );
  }

  return <TemplateGradientPreview template={template} />;
}
