# Vendor Template Selection System - Detailed Todo List

## Overview
Allow each vendor to choose and customize their own UI/UX template for their vendor page/storefront. This will enable vendors to have unique, branded storefronts while maintaining a consistent underlying structure.

**Goal**: Create a template system where vendors can select from pre-built templates and customize them to match their brand identity.

---

## Phase 1: Database Schema & Data Models

### Task 1.1: Create Vendor Templates Collection
**File**: `src/collections/VendorTemplates.ts`

**Technical Details**:
- **Collection Name**: `vendor-templates`
- **Fields**:
  - `name`: String (required) - Template name (e.g., "Modern Minimal", "Classic Elegance")
  - `slug`: String (required, unique) - URL-friendly identifier
  - `description`: Text - Template description
  - `previewImage`: Media (required) - Screenshot/preview of template
  - `thumbnailImage`: Media - Small thumbnail for selection UI
  - `category`: Select - Template category (minimal, elegant, bold, colorful, etc.)
  - `isDefault`: Boolean - Whether this is the default template for new vendors
  - `isActive`: Boolean - Whether template is available for selection
  - `version`: String - Template version number
  - `author`: String - Template creator/author
  - `templateConfig`: JSON - Template configuration schema
  - `cssVariables`: JSON - CSS custom properties/variables
  - `componentMapping`: JSON - Component structure mapping
  - `createdAt`: Date
  - `updatedAt`: Date

**Code Pattern**:
```typescript
export const VendorTemplates: CollectionConfig = {
  slug: "vendor-templates",
  admin: {
    useAsTitle: "name",
  },
  access: {
    read: () => true, // Public read
    create: ({ req: { user } }) => user?.role === "admin",
    update: ({ req: { user } }) => user?.role === "admin",
    delete: ({ req: { user } }) => user?.role === "admin",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
    },
    {
      name: "templateConfig",
      type: "json",
      required: true,
    },
    // ... other fields
  ],
};
```

---

### Task 1.2: Add Template Selection to Vendors Collection
**File**: `src/collections/Vendors.ts`

**Technical Details**:
- **Add Field**: `selectedTemplate` - Relationship to `vendor-templates` collection
- **Add Field**: `templateCustomization` - JSON field for vendor-specific customizations
- **Default**: Set `selectedTemplate` to default template if not specified

**Code Pattern**:
```typescript
{
  name: "selectedTemplate",
  type: "relationship",
  relationTo: "vendor-templates",
  defaultValue: async ({ req }) => {
    // Get default template
    const defaultTemplate = await req.payload.find({
      collection: "vendor-templates",
      where: { isDefault: { equals: true } },
      limit: 1,
    });
    return defaultTemplate.docs[0]?.id || null;
  },
},
{
  name: "templateCustomization",
  type: "json",
  defaultValue: {},
},
```

---

### Task 1.3: Create Template Customization Schema
**File**: `src/types/template-customization.ts`

**Technical Details**:
- Define TypeScript interface for template customization
- Include: colors, fonts, spacing, layout options, component visibility
- Validation schema using Zod

**Code Pattern**:
```typescript
export interface TemplateCustomization {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    textSecondary: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  spacing: {
    sectionPadding: string;
    cardGap: string;
  };
  layout: {
    productGridColumns: number;
    showBanner: boolean;
    showCategories: boolean;
  };
  components: {
    heroBanner: {
      enabled: boolean;
      style: "full-width" | "contained" | "split";
    };
    productCard: {
      style: "minimal" | "detailed" | "compact";
      showPrice: boolean;
      showRating: boolean;
    };
  };
}
```

---

## Phase 2: Template System Architecture

### Task 2.1: Create Template Engine/Resolver
**File**: `src/lib/templates/template-engine.ts`

**Technical Details**:
- Function to resolve template configuration for a vendor
- Merges base template config with vendor customizations
- Returns resolved CSS variables and component mappings
- Handles template inheritance and overrides

**Code Pattern**:
```typescript
export async function resolveVendorTemplate(
  vendorId: string,
  payload: Payload
): Promise<ResolvedTemplate> {
  const vendor = await payload.findByID({
    collection: "vendors",
    id: vendorId,
    depth: 1, // Include template
  });

  const template = vendor.selectedTemplate
    ? typeof vendor.selectedTemplate === "string"
      ? await payload.findByID({
          collection: "vendor-templates",
          id: vendor.selectedTemplate,
        })
      : vendor.selectedTemplate
    : await getDefaultTemplate(payload);

  const customization = vendor.templateCustomization || {};

  return {
    templateId: template.id,
    templateSlug: template.slug,
    cssVariables: mergeCSSVariables(template.cssVariables, customization.colors),
    componentMapping: template.componentMapping,
    customization,
  };
}
```

---

### Task 2.2: Create Template CSS Variable Generator
**File**: `src/lib/templates/css-variables.ts`

**Technical Details**:
- Generate CSS custom properties from template config
- Merge vendor customizations with template defaults
- Output CSS string for injection into page

**Code Pattern**:
```typescript
export function generateCSSVariables(
  templateConfig: TemplateConfig,
  customization: TemplateCustomization
): string {
  const variables = {
    "--color-primary": customization.colors?.primary || templateConfig.colors.primary,
    "--color-secondary": customization.colors?.secondary || templateConfig.colors.secondary,
    "--font-heading": customization.fonts?.heading || templateConfig.fonts.heading,
    "--spacing-section": customization.spacing?.sectionPadding || templateConfig.spacing.sectionPadding,
    // ... more variables
  };

  return Object.entries(variables)
    .map(([key, value]) => `${key}: ${value};`)
    .join("\n  ");
}
```

---

### Task 2.3: Create Template Component Registry
**File**: `src/lib/templates/component-registry.ts`

**Technical Details**:
- Map template component names to actual React components
- Support multiple component variants per template
- Handle component props based on template config

**Code Pattern**:
```typescript
const componentRegistry = {
  "hero-banner": {
    minimal: MinimalHeroBanner,
    fullWidth: FullWidthHeroBanner,
    split: SplitHeroBanner,
  },
  "product-card": {
    minimal: MinimalProductCard,
    detailed: DetailedProductCard,
    compact: CompactProductCard,
  },
  // ... more components
};

export function getComponent(
  componentName: string,
  variant: string
): React.ComponentType<any> {
  return componentRegistry[componentName]?.[variant] || DefaultComponent;
}
```

---

## Phase 3: Template Selection UI

### Task 3.1: Create Template Selection Page
**File**: `src/app/(app)/vendor/templates/page.tsx`

**Technical Details**:
- Display grid of available templates
- Show template preview images, names, descriptions
- Filter by category
- Search templates
- Show "Current Template" badge
- "Select Template" button for each template

**UI Components**:
- Template grid with cards
- Filter sidebar
- Search bar
- Preview modal

---

### Task 3.2: Create Template Preview Modal
**File**: `src/app/(app)/vendor/templates/components/TemplatePreviewModal.tsx`

**Technical Details**:
- Full-screen or large modal showing template preview
- Interactive preview (if possible)
- Template details (name, description, category, version)
- "Use This Template" button
- Close button

**Code Pattern**:
```typescript
<Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent className="max-w-6xl">
    <img src={template.previewImage.url} alt={template.name} />
    <DialogHeader>
      <DialogTitle>{template.name}</DialogTitle>
      <DialogDescription>{template.description}</DialogDescription>
    </DialogHeader>
    <Button onClick={handleSelectTemplate}>Use This Template</Button>
  </DialogContent>
</Dialog>
```

---

### Task 3.3: Create Template Selection tRPC Mutation
**File**: `src/modules/vendor/server/procedures.ts`

**Technical Details**:
- `vendor.templates.select` mutation
- Validates template exists and is active
- Updates vendor's `selectedTemplate` field
- Resets `templateCustomization` to template defaults
- Returns updated vendor data

**Code Pattern**:
```typescript
selectTemplate: vendorProcedure
  .input(z.object({ templateId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const vendorId = typeof ctx.session.vendor === "string"
      ? ctx.session.vendor
      : ctx.session.vendor.id;

    // Verify template exists and is active
    const template = await ctx.db.findByID({
      collection: "vendor-templates",
      id: input.templateId,
    });

    if (!template.isActive) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Template is not available",
      });
    }

    // Update vendor template
    await ctx.db.update({
      collection: "vendors",
      id: vendorId,
      data: {
        selectedTemplate: input.templateId,
        templateCustomization: {}, // Reset to defaults
      },
    });

    return { success: true };
  }),
```

---

### Task 3.4: Create Template List tRPC Query
**File**: `src/modules/vendor/server/procedures.ts`

**Technical Details**:
- `vendor.templates.list` query
- Returns all active templates
- Includes current vendor's selected template flag
- Filter by category
- Search functionality

**Code Pattern**:
```typescript
listTemplates: vendorProcedure
  .input(
    z.object({
      category: z.string().optional(),
      search: z.string().optional(),
    })
  )
  .query(async ({ ctx, input }) => {
    const vendorId = typeof ctx.session.vendor === "string"
      ? ctx.session.vendor
      : ctx.session.vendor.id;

    // Get vendor's current template
    const vendor = await ctx.db.findByID({
      collection: "vendors",
      id: vendorId,
      depth: 0,
    });

    const where: Where = {
      isActive: { equals: true },
    };

    if (input.category) {
      where.category = { equals: input.category };
    }

    if (input.search) {
      where.or = [
        { name: { contains: input.search } },
        { description: { contains: input.search } },
      ];
    }

    const templates = await ctx.db.find({
      collection: "vendor-templates",
      where,
      sort: "-createdAt",
    });

    return {
      docs: templates.docs.map((template) => ({
        ...template,
        isSelected: template.id === vendor.selectedTemplate,
      })),
    };
  }),
```

---

## Phase 4: Template Customization UI

### Task 4.1: Create Template Customization Page
**File**: `src/app/(app)/vendor/templates/customize/page.tsx`

**Technical Details**:
- Live preview of vendor page with current customizations
- Color picker for primary, secondary, accent colors
- Font selector for heading and body fonts
- Spacing controls (sliders)
- Layout options (checkboxes, toggles)
- Component visibility toggles
- "Save Customization" button
- "Reset to Default" button
- "Preview Changes" button

**UI Layout**:
- Left sidebar: Customization controls
- Right side: Live preview (iframe or component)

---

### Task 4.2: Create Color Picker Component
**File**: `src/app/(app)/vendor/templates/customize/components/ColorPicker.tsx`

**Technical Details**:
- Use shadcn/ui color picker or custom implementation
- Support hex, rgb, hsl color formats
- Show color swatches
- Preset color palettes
- Save to template customization

**Code Pattern**:
```typescript
<FormField
  control={form.control}
  name="colors.primary"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Primary Color</FormLabel>
      <FormControl>
        <div className="flex gap-2">
          <Input type="color" {...field} />
          <Input type="text" value={field.value} onChange={field.onChange} />
        </div>
      </FormControl>
    </FormItem>
  )}
/>
```

---

### Task 4.3: Create Font Selector Component
**File**: `src/app/(app)/vendor/templates/customize/components/FontSelector.tsx`

**Technical Details**:
- Dropdown with Google Fonts or system fonts
- Preview font in selector
- Apply to heading and body separately
- Show font preview text

**Font Options**:
- System fonts: Arial, Helvetica, Times New Roman, etc.
- Google Fonts: Roboto, Open Sans, Lato, Montserrat, etc.

---

### Task 4.4: Create Layout Options Component
**File**: `src/app/(app)/vendor/templates/customize/components/LayoutOptions.tsx`

**Technical Details**:
- Toggle switches for component visibility
- Number input for grid columns
- Select dropdowns for component styles
- Radio buttons for layout options

**Options**:
- Product grid columns: 2, 3, 4, 5, 6
- Show/hide: Banner, Categories, Filters, Reviews
- Component styles: Minimal, Detailed, Compact

---

### Task 4.5: Create Live Preview Component
**File**: `src/app/(app)/vendor/templates/customize/components/LivePreview.tsx`

**Technical Details**:
- Render vendor page with current customizations
- Update in real-time as user changes settings
- Use iframe or direct component rendering
- Apply CSS variables dynamically
- Show loading state during updates

**Code Pattern**:
```typescript
<div style={cssVariables}>
  <VendorStorefront
    vendorId={vendorId}
    template={resolvedTemplate}
    customization={customization}
  />
</div>
```

---

### Task 4.6: Create Template Customization tRPC Mutation
**File**: `src/modules/vendor/server/procedures.ts`

**Technical Details**:
- `vendor.templates.customize` mutation
- Validates customization schema
- Updates vendor's `templateCustomization` field
- Returns updated customization

**Code Pattern**:
```typescript
customizeTemplate: vendorProcedure
  .input(
    z.object({
      customization: z.object({
        colors: z.object({
          primary: z.string().optional(),
          secondary: z.string().optional(),
          // ... more color fields
        }).optional(),
        fonts: z.object({
          heading: z.string().optional(),
          body: z.string().optional(),
        }).optional(),
        // ... more customization fields
      }),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const vendorId = typeof ctx.session.vendor === "string"
      ? ctx.session.vendor
      : ctx.session.vendor.id;

    const vendor = await ctx.db.findByID({
      collection: "vendors",
      id: vendorId,
      depth: 0,
    });

    // Merge with existing customization
    const updatedCustomization = {
      ...(vendor.templateCustomization || {}),
      ...input.customization,
    };

    await ctx.db.update({
      collection: "vendors",
      id: vendorId,
      data: {
        templateCustomization: updatedCustomization,
      },
    });

    return { customization: updatedCustomization };
  }),
```

---

### Task 4.7: Create Template Customization tRPC Query
**File**: `src/modules/vendor/server/procedures.ts`

**Technical Details**:
- `vendor.templates.getCustomization` query
- Returns current vendor's template and customization
- Includes resolved template config

**Code Pattern**:
```typescript
getCustomization: vendorProcedure
  .query(async ({ ctx }) => {
    const vendorId = typeof ctx.session.vendor === "string"
      ? ctx.session.vendor
      : ctx.session.vendor.id;

    const vendor = await ctx.db.findByID({
      collection: "vendors",
      id: vendorId,
      depth: 1, // Include template
    });

    const template = vendor.selectedTemplate
      ? typeof vendor.selectedTemplate === "string"
        ? await ctx.db.findByID({
            collection: "vendor-templates",
            id: vendor.selectedTemplate,
          })
        : vendor.selectedTemplate
      : await getDefaultTemplate(ctx.db);

    return {
      template,
      customization: vendor.templateCustomization || {},
      resolvedConfig: await resolveVendorTemplate(vendorId, ctx.db),
    };
  }),
```

---

## Phase 5: Template Application to Vendor Pages

### Task 5.1: Update Vendor Storefront Page to Use Template
**File**: `src/app/(app)/(home)/vendors/[slug]/page.tsx`

**Technical Details**:
- Fetch vendor's selected template
- Resolve template configuration
- Apply CSS variables to page
- Use template component mapping
- Render vendor page with template styling

**Code Pattern**:
```typescript
export default async function VendorPage({ params }: { params: { slug: string } }) {
  const vendor = await getVendorBySlug(params.slug);
  const resolvedTemplate = await resolveVendorTemplate(vendor.id, payload);
  const cssVariables = generateCSSVariables(
    resolvedTemplate.templateConfig,
    resolvedTemplate.customization
  );

  return (
    <div style={{ ...cssVariables }}>
      <VendorStorefront
        vendor={vendor}
        template={resolvedTemplate}
      />
    </div>
  );
}
```

---

### Task 5.2: Create Vendor Storefront Component
**File**: `src/components/vendor/VendorStorefront.tsx`

**Technical Details**:
- Main component that renders vendor page
- Uses template component mapping
- Renders hero banner, products, categories based on template
- Applies template-specific component variants

**Code Pattern**:
```typescript
export function VendorStorefront({
  vendor,
  template,
}: {
  vendor: Vendor;
  template: ResolvedTemplate;
}) {
  const HeroComponent = getComponent("hero-banner", template.componentMapping.heroBanner);
  const ProductCardComponent = getComponent("product-card", template.componentMapping.productCard);

  return (
    <div className="vendor-storefront">
      {template.customization.components.heroBanner.enabled && (
        <HeroComponent vendor={vendor} />
      )}
      <ProductGrid
        vendor={vendor}
        ProductCard={ProductCardComponent}
        columns={template.customization.layout.productGridColumns}
      />
    </div>
  );
}
```

---

### Task 5.3: Create Template-Aware Product Card Variants
**File**: `src/components/vendor/products/ProductCardVariants.tsx`

**Technical Details**:
- MinimalProductCard: Simple card with image, name, price
- DetailedProductCard: Full card with image, name, price, rating, description, CTA
- CompactProductCard: Small card optimized for grid layouts

**Component Props**:
- `product`: Product data
- `template`: Template config for styling
- `customization`: Vendor customizations

---

### Task 5.4: Create Template-Aware Hero Banner Variants
**File**: `src/components/vendor/banner/HeroBannerVariants.tsx`

**Technical Details**:
- MinimalHeroBanner: Simple text overlay on image
- FullWidthHeroBanner: Full-width banner with text and CTA
- SplitHeroBanner: Split layout with image and text side-by-side

**Component Props**:
- `vendor`: Vendor data
- `banner`: Hero banner media/content
- `template`: Template config

---

### Task 5.5: Inject CSS Variables into Page
**File**: `src/app/(app)/(home)/vendors/[slug]/layout.tsx` or page component

**Technical Details**:
- Generate CSS variables from template
- Inject as inline style or CSS class
- Apply to root element or specific container
- Ensure variables are available to all child components

**Code Pattern**:
```typescript
<style jsx>{`
  :root {
    ${Object.entries(cssVariables)
      .map(([key, value]) => `${key}: ${value};`)
      .join("\n    ")}
  }
`}</style>
```

---

## Phase 6: Default Templates Creation

### Task 6.1: Create Minimal Template
**File**: Database seed or admin UI

**Technical Details**:
- Template name: "Minimal"
- Category: "minimal"
- Clean, simple design
- Neutral colors (white, gray, black)
- Sans-serif fonts
- Spacious layout

**Template Config**:
```json
{
  "colors": {
    "primary": "#000000",
    "secondary": "#666666",
    "accent": "#000000",
    "background": "#FFFFFF",
    "text": "#000000"
  },
  "fonts": {
    "heading": "Inter",
    "body": "Inter"
  },
  "componentMapping": {
    "heroBanner": "minimal",
    "productCard": "minimal"
  }
}
```

---

### Task 6.2: Create Elegant Template
**File**: Database seed or admin UI

**Technical Details**:
- Template name: "Elegant"
- Category: "elegant"
- Sophisticated design
- Rich colors (deep blues, golds)
- Serif fonts for headings
- Refined spacing

---

### Task 6.3: Create Bold Template
**File**: Database seed or admin UI

**Technical Details**:
- Template name: "Bold"
- Category: "bold"
- Vibrant, eye-catching design
- Bright, contrasting colors
- Bold fonts
- Dynamic layouts

---

### Task 6.4: Create Colorful Template
**File**: Database seed or admin UI

**Technical Details**:
- Template name: "Colorful"
- Category: "colorful"
- Playful, energetic design
- Multiple accent colors
- Fun fonts
- Colorful backgrounds

---

### Task 6.5: Create Classic Template
**File**: Database seed or admin UI

**Technical Details**:
- Template name: "Classic"
- Category: "classic"
- Traditional, timeless design
- Muted colors
- Classic fonts
- Balanced layouts

---

## Phase 7: Admin Template Management

### Task 7.1: Create Admin Template List Page
**File**: `src/app/(app)/admin/templates/page.tsx`

**Technical Details**:
- List all templates (active and inactive)
- Show template details
- Edit, delete, activate/deactivate templates
- Set default template
- Upload preview images

---

### Task 7.2: Create Admin Template Editor
**File**: `src/app/(app)/admin/templates/[id]/edit/page.tsx`

**Technical Details**:
- Form to edit template details
- JSON editor for template config
- CSS variables editor
- Component mapping editor
- Preview image upload
- Save template

---

### Task 7.3: Create Admin Template Creation Page
**File**: `src/app/(app)/admin/templates/new/page.tsx`

**Technical Details**:
- Form to create new template
- All template fields
- Template config builder
- Preview image upload
- Save as draft or publish

---

## Phase 8: Template Preview & Testing

### Task 8.1: Create Template Preview Route
**File**: `src/app/(app)/templates/preview/[templateId]/page.tsx`

**Technical Details**:
- Public preview of template
- Show template with sample data
- Allow vendors to preview before selecting
- No authentication required

---

### Task 8.2: Create Template Comparison View
**File**: `src/app/(app)/vendor/templates/compare/page.tsx`

**Technical Details**:
- Side-by-side comparison of templates
- Show 2-4 templates at once
- Highlight differences
- "Select" button for each template

---

### Task 8.3: Add Template Analytics
**File**: `src/modules/analytics/template-analytics.ts`

**Technical Details**:
- Track template usage
- Most popular templates
- Template performance metrics
- Vendor satisfaction with templates

---

## Phase 9: Advanced Customization Features

### Task 9.1: Create Custom CSS Editor
**File**: `src/app/(app)/vendor/templates/customize/css-editor/page.tsx`

**Technical Details**:
- Code editor for custom CSS
- Syntax highlighting
- CSS validation
- Preview changes
- Save custom CSS to vendor profile

**Note**: Advanced feature, may require vendor to have CSS knowledge

---

### Task 9.2: Create Template Presets
**File**: `src/app/(app)/vendor/templates/presets/page.tsx`

**Technical Details**:
- Pre-configured customization presets
- One-click apply preset
- Create custom presets
- Share presets (future feature)

**Preset Examples**:
- "Dark Mode"
- "Warm Colors"
- "Cool Colors"
- "High Contrast"

---

### Task 9.3: Create Template Import/Export
**File**: `src/lib/templates/import-export.ts`

**Technical Details**:
- Export template configuration as JSON
- Import template from JSON file
- Validate imported template
- Apply imported template to vendor

**Use Cases**:
- Backup/restore customizations
- Share templates between vendors
- Template migration

---

## Phase 10: Performance & Optimization

### Task 10.1: Cache Template Resolutions
**File**: `src/lib/templates/cache.ts`

**Technical Details**:
- Cache resolved template configs
- Invalidate cache on template/customization update
- Use Redis or in-memory cache
- Cache key: `template:${vendorId}`

**Code Pattern**:
```typescript
const cacheKey = `template:${vendorId}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const resolved = await resolveVendorTemplate(vendorId, payload);
await redis.setex(cacheKey, 3600, JSON.stringify(resolved)); // 1 hour TTL
return resolved;
```

---

### Task 10.2: Optimize CSS Variable Injection
**File**: `src/lib/templates/css-optimization.ts`

**Technical Details**:
- Generate CSS once per template
- Cache generated CSS
- Minify CSS variables
- Use CSS custom properties efficiently

---

### Task 10.3: Lazy Load Template Components
**File**: `src/components/vendor/lazy-components.tsx`

**Technical Details**:
- Use React.lazy() for template components
- Code split by template
- Reduce initial bundle size
- Load components on demand

**Code Pattern**:
```typescript
const MinimalProductCard = React.lazy(() => import("./ProductCardVariants").then(m => ({ default: m.MinimalProductCard })));
```

---

## Phase 11: Documentation & User Guides

### Task 11.1: Create Template Selection Guide
**File**: `docs/vendor/template-selection-guide.md`

**Technical Details**:
- How to select a template
- Template categories explained
- Previewing templates
- Making your selection

---

### Task 11.2: Create Template Customization Guide
**File**: `docs/vendor/template-customization-guide.md`

**Technical Details**:
- How to customize colors
- How to change fonts
- Layout options explained
- Component visibility controls
- Saving customizations

---

### Task 11.3: Create Template Best Practices
**File**: `docs/vendor/template-best-practices.md`

**Technical Details**:
- Choosing the right template for your brand
- Color selection tips
- Font pairing recommendations
- Layout optimization
- Mobile responsiveness considerations

---

## Phase 12: Testing & Quality Assurance

### Task 12.1: Create Template Selection Tests
**File**: `tests/vendor/template-selection.spec.ts`

**Technical Details**:
- Test template selection flow
- Test template preview
- Test template switching
- Test validation

---

### Task 12.2: Create Template Customization Tests
**File**: `tests/vendor/template-customization.spec.ts`

**Technical Details**:
- Test color customization
- Test font customization
- Test layout changes
- Test customization persistence

---

### Task 12.3: Create Template Rendering Tests
**File**: `tests/vendor/template-rendering.spec.ts`

**Technical Details**:
- Test template application to vendor pages
- Test CSS variable injection
- Test component mapping
- Test responsive design

---

### Task 12.4: Create Template Performance Tests
**File**: `tests/vendor/template-performance.spec.ts`

**Technical Details**:
- Test page load time with different templates
- Test CSS variable generation performance
- Test template resolution caching
- Test bundle size impact

---

## Implementation Order

### Phase 1: Foundation (Tasks 1.1-1.3)
1. Create database schema
2. Add fields to Vendors collection
3. Define TypeScript types

### Phase 2: Core System (Tasks 2.1-2.3)
1. Build template engine
2. Create CSS variable generator
3. Set up component registry

### Phase 3: Selection UI (Tasks 3.1-3.4)
1. Build template selection page
2. Create preview modal
3. Implement tRPC queries/mutations

### Phase 4: Customization UI (Tasks 4.1-4.7)
1. Build customization page
2. Create customization components
3. Implement live preview
4. Add tRPC endpoints

### Phase 5: Application (Tasks 5.1-5.5)
1. Update vendor pages to use templates
2. Create storefront component
3. Build component variants
4. Inject CSS variables

### Phase 6: Default Templates (Tasks 6.1-6.5)
1. Create 5 default templates
2. Seed database with templates

### Phase 7-12: Polish & Advanced Features
1. Admin management
2. Preview & testing
3. Advanced customization
4. Performance optimization
5. Documentation
6. Testing

---

## Technical Considerations

### Database
- **Collections**: `vendor-templates`, `vendors` (updated)
- **Relationships**: Vendor → Template (many-to-one)
- **JSON Fields**: `templateConfig`, `templateCustomization`, `cssVariables`

### Frontend
- **React Components**: Template-aware components
- **State Management**: React Query for template data
- **Styling**: CSS custom properties (CSS variables)
- **Code Splitting**: Lazy load template components

### Backend
- **tRPC Procedures**: Template selection, customization, queries
- **Template Resolution**: Server-side template engine
- **Caching**: Redis or in-memory cache for resolved templates

### Performance
- **Caching**: Cache resolved templates (1 hour TTL)
- **Code Splitting**: Lazy load template components
- **CSS Optimization**: Minify and cache generated CSS
- **Bundle Size**: Keep template code separate from main bundle

### Security
- **Access Control**: Only vendors can customize their own templates
- **Template Validation**: Validate template configs before saving
- **CSS Sanitization**: Sanitize custom CSS to prevent XSS

---

## Future Enhancements

1. **Template Marketplace**: Allow vendors to create and sell templates
2. **Template Builder**: Visual drag-and-drop template builder
3. **A/B Testing**: Test different templates for conversion
4. **Template Analytics**: Track template performance
5. **Mobile Templates**: Separate mobile-specific templates
6. **Seasonal Templates**: Time-based template switching
7. **Template Versioning**: Track template changes and rollback
8. **Multi-Language Templates**: Templates with i18n support

---

## File Structure

```
src/
├── collections/
│   ├── VendorTemplates.ts
│   └── Vendors.ts (updated)
├── app/(app)/
│   ├── vendor/
│   │   ├── templates/
│   │   │   ├── page.tsx (template selection)
│   │   │   ├── customize/
│   │   │   │   └── page.tsx (customization UI)
│   │   │   └── components/
│   │   │       ├── TemplatePreviewModal.tsx
│   │   │       ├── ColorPicker.tsx
│   │   │       ├── FontSelector.tsx
│   │   │       ├── LayoutOptions.tsx
│   │   │       └── LivePreview.tsx
│   │   └── ...
│   ├── admin/
│   │   └── templates/
│   │       ├── page.tsx
│   │       ├── [id]/
│   │       │   └── edit/page.tsx
│   │       └── new/page.tsx
│   └── (home)/
│       └── vendors/
│           └── [slug]/
│               └── page.tsx (updated to use template)
├── components/
│   └── vendor/
│       ├── VendorStorefront.tsx
│       ├── products/
│       │   └── ProductCardVariants.tsx
│       └── banner/
│           └── HeroBannerVariants.tsx
├── lib/
│   └── templates/
│       ├── template-engine.ts
│       ├── css-variables.ts
│       ├── component-registry.ts
│       ├── cache.ts
│       └── import-export.ts
├── modules/
│   └── vendor/
│       └── server/
│           └── procedures.ts (add template procedures)
└── types/
    └── template-customization.ts
```

---

## Estimated Timeline

- **Phase 1-2**: 1-2 weeks (Foundation & Core System)
- **Phase 3-4**: 2-3 weeks (Selection & Customization UI)
- **Phase 5**: 1-2 weeks (Template Application)
- **Phase 6**: 1 week (Default Templates)
- **Phase 7-8**: 1-2 weeks (Admin & Preview)
- **Phase 9-10**: 1-2 weeks (Advanced Features & Optimization)
- **Phase 11-12**: 1 week (Documentation & Testing)

**Total**: 8-13 weeks

---

## Success Metrics

1. **Adoption Rate**: % of vendors using custom templates
2. **Template Diversity**: Number of unique templates in use
3. **Customization Usage**: % of vendors customizing templates
4. **Performance**: Page load time with templates
5. **User Satisfaction**: Vendor feedback on template system
6. **Conversion Rate**: Impact of templates on sales

---

## Notes

- Start with 3-5 default templates
- Focus on mobile responsiveness
- Ensure accessibility (WCAG compliance)
- Consider SEO implications of template changes
- Plan for template migration if vendors switch templates
- Document template API for future extensions
