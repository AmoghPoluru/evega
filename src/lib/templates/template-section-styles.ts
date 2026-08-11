/**
 * Scoped CSS for Sections panel settings (hero height, product card radius).
 */
export function buildVendorSectionStyles(scopeClass: string): string {
  return `
.${scopeClass} [data-template-hero-banner] {
  height: var(--template-banner-height, 480px);
}

.${scopeClass} [data-template-product-card] {
  border-radius: var(--template-card-radius, 8px);
}

.${scopeClass} [data-template-product-card-media] {
  border-radius: var(--template-card-radius, 8px);
  overflow: hidden;
}
`.trim();
}
