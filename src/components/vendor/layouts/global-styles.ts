/**
 * Global storefront CSS injected by template-driven layouts.
 * Mirrors the style block used by DefaultLayout: animated mesh-gradient
 * background, glassy cards and template-variable driven typography.
 */
export function buildTemplateGlobalStyles(cssVariables: string): string {
  return `
    ${cssVariables ? `:root {
      ${cssVariables}
    }` : ''}

    /* The Vibrant Animated Background */
    .vendor-page-template {
      background-color: var(--template-primary, #FF6B9D) !important;
      background-image:
        radial-gradient(at 0% 0%, var(--template-secondary, #C44569) 0px, transparent 50%),
        radial-gradient(at 100% 0%, var(--template-accent, #FFD93D) 0px, transparent 50%),
        radial-gradient(at 100% 100%, var(--template-primary, #FF6B9D) 0px, transparent 50%),
        radial-gradient(at 0% 100%, var(--template-secondary, #C44569) 0px, transparent 50%);
      background-attachment: fixed;
      background-size: 200% 200%;
      background-position: 0% 50%;
      animation: gradientMove 15s ease infinite;
    }

    @keyframes gradientMove {
      0% { background-position: 0% 50%; }
      25% { background-position: 100% 0%; }
      50% { background-position: 100% 100%; }
      75% { background-position: 0% 100%; }
      100% { background-position: 0% 50%; }
    }

    /* Force the container to be transparent so the background shows through */
    .vendor-main-container {
      background: transparent !important;
    }

    /* Make cards look modern and "Glassy" against the vibrant back */
    .vendor-page-template [class*="card"],
    .vendor-page-template .vendor-info-header,
    .vendor-page-template a[href*="/products/"] > div {
      background-color: rgba(255, 255, 255, 0.9) !important;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15) !important;
      border-radius: var(--template-card-radius, 8px) !important;
    }

    /* Override ProductsList wrapper background */
    .vendor-page-template .bg-gray-50 {
      background: transparent !important;
    }

    .vendor-page-template h1,
    .vendor-page-template .breadcrumb-text {
      text-shadow: 0px 2px 4px rgba(0,0,0,0.1);
    }

    /* Style buttons to be extra punchy */
    .vendor-page-template button[class*="bg-"] {
      background-color: var(--template-primary) !important;
      filter: saturate(1.5);
      transition: transform 0.2s ease;
    }

    .vendor-page-template button[class*="bg-"]:hover {
      transform: scale(1.05);
    }

    /* Apply template styles to all elements on vendor page */
    .vendor-page-template * {
      font-family: var(--template-font-body) !important;
    }
    .vendor-page-template h1 {
      font-family: var(--template-font-heading) !important;
      color: var(--template-text) !important;
      font-size: var(--template-h1-size, 2.5rem) !important;
      font-weight: var(--template-h1-weight, 700) !important;
      letter-spacing: var(--template-h1-spacing, 0) !important;
      line-height: var(--template-h1-height, 1.2) !important;
      text-transform: var(--template-h1-transform, none) !important;
    }
    .vendor-page-template h2 {
      font-family: var(--template-font-heading) !important;
      color: var(--template-text) !important;
      font-size: var(--template-h2-size, 2rem) !important;
      font-weight: var(--template-h2-weight, 600) !important;
      letter-spacing: var(--template-h2-spacing, 0) !important;
      line-height: var(--template-h2-height, 1.3) !important;
      text-transform: var(--template-h2-transform, none) !important;
    }
    .vendor-page-template h3,
    .vendor-page-template h4,
    .vendor-page-template h5,
    .vendor-page-template h6 {
      font-family: var(--template-font-heading) !important;
      color: var(--template-text) !important;
    }
    .vendor-page-template p,
    .vendor-page-template span,
    .vendor-page-template div {
      font-size: var(--template-body-size, 1rem) !important;
      font-weight: var(--template-body-weight, 400) !important;
      letter-spacing: var(--template-body-spacing, 0) !important;
      line-height: var(--template-body-height, 1.6) !important;
    }

    /* Hero banner text must stay white and legible */
    .vendor-page-template [class*="hero"] h1,
    .vendor-page-template [class*="banner"] h1 {
      color: white !important;
      font-size: var(--template-hero-title-size, 3rem) !important;
      font-weight: var(--template-hero-title-weight, 700) !important;
      text-shadow: var(--template-hero-text-shadow, 2px 2px 4px rgba(0, 0, 0, 0.7), 0 0 8px rgba(0, 0, 0, 0.5)) !important;
    }
    .vendor-page-template [class*="hero"] h2,
    .vendor-page-template [class*="hero"] p,
    .vendor-page-template [class*="banner"] h2,
    .vendor-page-template [class*="banner"] p,
    .vendor-page-template [class*="text-white"] {
      color: white !important;
      font-size: var(--template-hero-subtitle-size, 1.5rem) !important;
      font-weight: var(--template-hero-subtitle-weight, 400) !important;
      text-shadow: var(--template-hero-text-shadow, 2px 2px 4px rgba(0, 0, 0, 0.7), 0 0 8px rgba(0, 0, 0, 0.5)) !important;
    }
    .vendor-page-template a {
      color: var(--template-primary) !important;
    }
    .vendor-page-template a:hover {
      color: var(--template-secondary) !important;
    }
    .vendor-page-template [class*="text-gray"] {
      color: var(--template-text-secondary) !important;
    }
  `;
}
