"use client";

import React, { useEffect, useState } from "react";
import { useField, useFormFields } from "@payloadcms/ui";

interface VariantDataFieldProps {
  path: string;
  label?: string;
  required?: boolean;
}

const VariantDataField: React.FC<VariantDataFieldProps> = ({
  path,
  label,
  required,
}) => {
  const { value, setValue } = useField<Record<string, any>>({ path });
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [variantConfig, setVariantConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Watch the category field to get category ID
  const categoryField = useFormFields(([fields]) => fields.category);

  useEffect(() => {
    const category = categoryField?.value;
    console.log("Category field value:", category);
    if (category) {
      const catId = typeof category === "string" ? category : (category as any)?.id;
      console.log("Extracted category ID:", catId);
      setCategoryId(catId || null);
    } else {
      console.log("No category value found");
      setCategoryId(null);
    }
  }, [categoryField]);

  // Fetch category variant config when category changes
  useEffect(() => {
    if (!categoryId) {
      setVariantConfig(null);
      return;
    }

    setLoading(true);
    // Use Payload's REST API with depth to populate relationships
    fetch(`/api/categories/${categoryId}?depth=3`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch category: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Category data:", data);
        
        // Handle both response formats: { doc: {...} } or direct {...}
        const category = data.doc || data;
        if (!category?.variantConfig) {
          console.warn("No variantConfig found in category", { category, data });
          setVariantConfig(null);
          setLoading(false);
          return;
        }

        const config = category.variantConfig;
        console.log("Variant config:", config);

        // Handle both populated objects and IDs
        const requiredVariants = (config.requiredVariants || []).map((vt: any) => 
          typeof vt === "object" && vt !== null && vt.id ? vt : null
        ).filter(Boolean);
        
        const optionalVariants = (config.optionalVariants || []).map((vt: any) => 
          typeof vt === "object" && vt !== null && vt.id ? vt : null
        ).filter(Boolean);

        const variantTypes = [...requiredVariants, ...optionalVariants];
        console.log("Variant types:", variantTypes);

        if (variantTypes.length === 0) {
          console.warn("No variant types found in category config");
          // Fallback: try to use JSON variantOptions if available
          if (config.variantOptions && typeof config.variantOptions === 'object') {
            const jsonVariantTypes = Object.keys(config.variantOptions).map((slug) => ({
              id: slug,
              slug: slug,
              name: slug.charAt(0).toUpperCase() + slug.slice(1),
              type: "select",
              options: (config.variantOptions[slug] || []).map((opt: string) => ({
                value: opt,
                label: opt,
              })),
            }));
            
            if (jsonVariantTypes.length > 0) {
              console.log("Using JSON fallback variant types:", jsonVariantTypes);
              setVariantConfig({
                ...config,
                variantTypes: jsonVariantTypes,
              });
              setLoading(false);
              return;
            }
          }
          setVariantConfig(null);
          setLoading(false);
          return;
        }

        // First, try to use JSON variantOptions as a quick fallback
        if (config.variantOptions && typeof config.variantOptions === 'object') {
          const jsonVariantTypes = variantTypes.map((vt: any) => {
            const variantSlug = typeof vt === "string" ? null : vt.slug;
            const variantName = typeof vt === "string" ? null : vt.name;
            const variantTypeId = typeof vt === "string" ? vt : vt.id;
            const variantType = typeof vt === "string" ? "select" : (vt.type || "select");

            // Get options from JSON config
            const jsonOptions = variantSlug && config.variantOptions[variantSlug] 
              ? (config.variantOptions[variantSlug] || []).map((opt: string) => ({
                  value: opt,
                  label: opt,
                }))
              : [];

            return {
              id: variantTypeId,
              slug: variantSlug || "unknown",
              name: variantName || "Unknown",
              type: variantType,
              options: jsonOptions,
            };
          });

          // If we have options from JSON, use them immediately
          if (jsonVariantTypes.some((vt: any) => vt.options.length > 0)) {
            console.log("Using JSON variant options:", jsonVariantTypes);
            setVariantConfig({
              ...config,
              variantTypes: jsonVariantTypes,
            });
            setLoading(false);
            
            // Then fetch from API in background to enrich with hexCode, etc.
            Promise.all(
              variantTypes.map((vt: any) => {
                const variantTypeId = typeof vt === "string" ? vt : vt.id;
                const variantSlug = typeof vt === "string" ? null : vt.slug;
                const queryUrl = `/api/variant-options?where[and][0][variantType][equals]=${variantTypeId}&where[or][0][category][equals]=null&where[or][1][category][equals]=${categoryId}&sort=displayOrder&limit=100`;
                
                return fetch(queryUrl)
                  .then((res) => res.json())
                  .then((optionsData) => {
                    const apiOptions = (optionsData.docs || []).map((opt: any) => ({
                      value: opt.value,
                      label: opt.label || opt.value,
                      hexCode: opt.hexCode || null,
                    }));
                    return { slug: variantSlug, options: apiOptions };
                  })
                  .catch(() => ({ slug: variantSlug, options: [] }));
              })
            ).then((apiResults) => {
              // Merge API options with JSON options
              const enrichedTypes = jsonVariantTypes.map((vt: any) => {
                const apiResult = apiResults.find((r: any) => r.slug === vt.slug);
                if (apiResult && apiResult.options.length > 0) {
                  // Merge, preferring API options (they have hexCode, etc.)
                  const existingValues = new Set(vt.options.map((opt: any) => opt.value));
                  apiResult.options.forEach((opt: any) => {
                    const existing = vt.options.find((o: any) => o.value === opt.value);
                    if (existing) {
                      Object.assign(existing, opt); // Update with hexCode, etc.
                    } else if (!existingValues.has(opt.value)) {
                      vt.options.push(opt);
                    }
                  });
                }
                return vt;
              });
              
              setVariantConfig({
                ...config,
                variantTypes: enrichedTypes,
              });
            });
            return;
          }
        }

        // Fetch options for each variant type using Payload REST API
        Promise.all(
          variantTypes.map((vt: any) => {
            const variantTypeId = typeof vt === "string" ? vt : vt.id;
            const variantSlug = typeof vt === "string" ? null : vt.slug;
            const variantName = typeof vt === "string" ? null : vt.name;
            const variantType = typeof vt === "string" ? "select" : (vt.type || "select");

            // Build query URL - handle both global and category-specific options
            const queryUrl = `/api/variant-options?where[and][0][variantType][equals]=${variantTypeId}&where[or][0][category][equals]=null&where[or][1][category][equals]=${categoryId}&sort=displayOrder&limit=100`;
            
            return fetch(queryUrl)
              .then((res) => {
                if (!res.ok) {
                  throw new Error(`Failed to fetch variant options: ${res.statusText}`);
                }
                return res.json();
              })
              .then((optionsData) => {
                const options = (optionsData.docs || []).map((opt: any) => ({
                  value: opt.value,
                  label: opt.label || opt.value,
                  hexCode: opt.hexCode || null,
                }));

                // Also check JSON fallback from category config
                if (variantSlug && config.variantOptions?.[variantSlug]) {
                  const jsonOptions = config.variantOptions[variantSlug];
                  if (Array.isArray(jsonOptions)) {
                    const existingValues = new Set(options.map((opt: any) => opt.value));
                    jsonOptions.forEach((opt: string) => {
                      if (!existingValues.has(opt)) {
                        options.push({ value: opt, label: opt });
                      }
                    });
                  }
                }

                return {
                  id: variantTypeId,
                  slug: variantSlug || "unknown",
                  name: variantName || "Unknown",
                  type: variantType,
                  options: options,
                };
              })
              .catch((err) => {
                console.error(`Error fetching options for variant type ${variantTypeId}:`, err);
                // Fallback to JSON if API fails
                const jsonOptions = variantSlug && config.variantOptions?.[variantSlug]
                  ? (config.variantOptions[variantSlug] || []).map((opt: string) => ({
                      value: opt,
                      label: opt,
                    }))
                  : [];
                
                return {
                  id: variantTypeId,
                  slug: variantSlug || "unknown",
                  name: variantName || "Unknown",
                  type: variantType,
                  options: jsonOptions,
                };
              });
          })
        ).then((variantTypesWithOptions) => {
          console.log("Variant types with options:", variantTypesWithOptions);
          setVariantConfig({
            ...config,
            variantTypes: variantTypesWithOptions,
          });
          setLoading(false);
        });
      })
      .catch((err) => {
        console.error("Error fetching category variant config:", err);
        setVariantConfig(null);
        setLoading(false);
      });
  }, [categoryId]);

  const variantData = value || {};
  const variantTypes = variantConfig?.variantTypes || [];
  const requiredVariants = (variantConfig?.requiredVariants || [])
    .map((vt: any) => (typeof vt === "object" ? vt.slug : vt))
    .filter(Boolean);

  const updateVariantData = (variantType: string, optionValue: string) => {
    setValue({
      ...variantData,
      [variantType]: optionValue,
    });
  };

  if (!categoryId) {
    return (
      <div className="field-type json">
        <label className="field-label">
          {label || "Variant Data"}
          {required && <span className="required">*</span>}
        </label>
        <div className="field-description" style={{ color: "#666", marginBottom: "0.5rem" }}>
          Please select a category first to see dynamic variant fields.
          {categoryField?.value ? (
            <div style={{ marginTop: "0.5rem", fontSize: "0.875rem" }}>
              Current category value: {JSON.stringify(categoryField.value as any)}
            </div>
          ) : null}
        </div>
        <textarea
          value={JSON.stringify(variantData, null, 2)}
          onChange={(e) => {
            try {
              setValue(JSON.parse(e.target.value));
            } catch (err) {
              // Invalid JSON, ignore
            }
          }}
          className="field-type json"
          rows={4}
          placeholder='{"size": "Small", "color": "Red"}'
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="field-type json">
        <label className="field-label">
          {label || "Variant Data"}
          {required && <span className="required">*</span>}
        </label>
        <div>Loading variant configuration...</div>
      </div>
    );
  }

  if (!variantConfig || variantTypes.length === 0) {
    return (
      <div className="field-type json">
        <label className="field-label">
          {label || "Variant Data"}
          {required && <span className="required">*</span>}
        </label>
        <div className="field-description" style={{ color: "#666", marginBottom: "0.5rem" }}>
          {!variantConfig 
            ? "This category doesn't have variant configuration. Use JSON format:"
            : "No variant types found. Use JSON format:"}
          {categoryId && (
            <div style={{ marginTop: "0.5rem", fontSize: "0.875rem" }}>
              Category ID: {categoryId} | Check browser console for details
            </div>
          )}
        </div>
        <textarea
          value={JSON.stringify(variantData, null, 2)}
          onChange={(e) => {
            try {
              setValue(JSON.parse(e.target.value));
            } catch (err) {
              // Invalid JSON, ignore
            }
          }}
          className="field-type json"
          rows={4}
          placeholder='{"size": "Small", "color": "Red"}'
        />
        <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#666" }}>
          Example: {"{"}"size": "Small", "color": "Red"{"}"}
        </div>
      </div>
    );
  }

  return (
    <div className="field-type json">
      <label className="field-label">
        {label || "Variant Data"}
        {required && <span className="required">*</span>}
      </label>
      <div className="field-description">
        Select values for each variant type based on category configuration.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
        {variantTypes.map((variantType: any) => {
          const isRequired = requiredVariants.includes(variantType.slug);
          const currentValue = variantData[variantType.slug] || "";
          const options = variantType.options || [];

          return (
            <div key={variantType.slug} style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                {variantType.name}
                {isRequired && <span style={{ color: "red", marginLeft: "4px" }}>*</span>}
              </label>
              {options.length > 0 ? (
                <select
                  value={currentValue}
                  onChange={(e) => updateVariantData(variantType.slug, e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                >
                  <option value="">Select {variantType.name}</option>
                  {options.map((option: any) => (
                    <option key={option.value} value={option.value}>
                      {option.label || option.value}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={currentValue}
                  onChange={(e) => updateVariantData(variantType.slug, e.target.value)}
                  placeholder={`Enter ${variantType.name}`}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      {/* Show JSON representation for debugging */}
      <details style={{ marginTop: "1rem" }}>
        <summary style={{ cursor: "pointer", fontSize: "0.875rem", color: "#666" }}>
          View JSON
        </summary>
        <pre
          style={{
            marginTop: "0.5rem",
            padding: "0.5rem",
            background: "#f5f5f5",
            borderRadius: "4px",
            fontSize: "0.75rem",
            overflow: "auto",
          }}
        >
          {JSON.stringify(variantData, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default VariantDataField;
