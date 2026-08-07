export type VendorLogoPreset =
  | "lotus-grace"
  | "peacock-royal"
  | "mandala-gold"
  | "silk-emblem"
  | "temple-arch";

export type VendorLogoTheme = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
};

export type VendorLogoDocFields = {
  id?: string;
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  preset?: VendorLogoPreset | null;
  defaultWord1?: string | null;
  defaultWord2?: string | null;
  vendorWords?: {
    word1?: { label?: string | null; hint?: string | null; defaultValue?: string | null } | null;
    word2?: { label?: string | null; hint?: string | null; defaultValue?: string | null } | null;
  } | null;
  theme?: {
    primary?: string | null;
    secondary?: string | null;
    accent?: string | null;
    background?: string | null;
  } | null;
  previewImage?: string | { id?: string; url?: string | null } | null;
  isDefault?: boolean | null;
  isActive?: boolean | null;
};

export type ResolvedVendorLogoTemplate = {
  templateId: string;
  templateName: string;
  preset: VendorLogoPreset;
  word1: string;
  word2: string;
  theme: VendorLogoTheme;
};

export type VendorLogoSource = "upload" | "template";
