"use client";

import Link from "next/link";
import Image from "next/image";
import type { SectionProps } from "./types";

/**
 * VendorInfoSection
 * Breadcrumb plus the thin sticky vendor bar (logo, name, product count and
 * contact links) extracted from the original DefaultLayout.
 */
export function VendorInfoSection({ settings, vendor, products, preview }: SectionProps) {
  const showBreadcrumb = settings.showBreadcrumb !== false;
  const showContact = settings.showContact !== false;
  const sticky = settings.sticky !== false && !preview;
  const totalDocs = products.length;

  return (
    <>
      {showBreadcrumb && (
        <div className="container mx-auto px-4 pt-2 vendor-main-container">
          <div className="max-w-7xl mx-auto">
            <nav className="mb-2 flex items-center gap-2 text-sm">
              <Link
                href="/"
                className="hover:underline"
                style={{ color: "var(--template-primary)" }}
              >
                Home
              </Link>
              <span style={{ color: "var(--template-text-secondary)" }}>/</span>
              <span style={{ color: "var(--template-text-secondary)" }}>Vendors</span>
              <span style={{ color: "var(--template-text-secondary)" }}>/</span>
              <span style={{ color: "var(--template-text)" }}>{vendor.name}</span>
            </nav>
          </div>
        </div>
      )}

      <div
        className={`vendor-info-header border-b z-20${sticky ? " sticky top-0" : ""}`}
        style={{
          borderColor: "var(--template-border)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between gap-4 py-2">
              {/* Left: Logo and Name */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {vendor.logo && typeof vendor.logo === "object" && vendor.logo.url ? (
                  <div className="relative w-10 h-10 rounded overflow-hidden bg-white border border-white shadow-sm">
                    <Image
                      src={vendor.logo.url}
                      alt={vendor.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center border border-white shadow-sm">
                    <span
                      className="text-white text-sm font-bold"
                      style={{ fontFamily: "var(--template-font-heading)" }}
                    >
                      {String(vendor.name ?? "?").charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <h1 className="template-type-vendor text-base font-bold">
                  {vendor.name}
                </h1>
                {totalDocs > 0 && (
                  <span className="template-type-vendor template-vendor-meta text-xs px-2 py-0.5 rounded-full font-medium">
                    {totalDocs} {totalDocs === 1 ? "Product" : "Products"}
                  </span>
                )}
              </div>

              {/* Right: Contact Info */}
              {showContact && (
                <div className="flex items-center gap-4 text-xs flex-wrap">
                  {vendor.email && (
                    <a
                      href={`mailto:${vendor.email}`}
                      className="template-type-vendor hover:underline whitespace-nowrap"
                    >
                      {vendor.email}
                    </a>
                  )}
                  {vendor.phone && (
                    <a
                      href={`tel:${vendor.phone}`}
                      className="template-type-vendor hover:underline whitespace-nowrap"
                    >
                      {vendor.phone}
                    </a>
                  )}
                  {vendor.website && (
                    <a
                      href={
                        vendor.website.startsWith("http")
                          ? vendor.website
                          : `https://${vendor.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="template-type-vendor hover:underline whitespace-nowrap"
                    >
                      Website
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
