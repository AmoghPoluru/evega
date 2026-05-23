"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface VariantType {
  slug: string;
  name: string;
}

interface VariantOption {
  value: string;
  label: string;
  hexCode?: string;
}

interface BulkVariantGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variantTypes: VariantType[];
  variantOptionsMap: Record<string, VariantOption[]>;
  onGenerate: (variants: Array<{ variantData: Record<string, string>; stock: number; price?: number }>) => void;
}

// Generate cartesian product of arrays
function cartesianProduct<T>(arrays: T[][]): T[][] {
  if (arrays.length === 0) return [[]];
  if (arrays.length === 1) return arrays[0].map(item => [item]);
  
  const [first, ...rest] = arrays;
  const restProduct = cartesianProduct(rest);
  
  const result: T[][] = [];
  for (const item of first) {
    for (const product of restProduct) {
      result.push([item, ...product]);
    }
  }
  return result;
}

export function BulkVariantGenerator({
  open,
  onOpenChange,
  variantTypes,
  variantOptionsMap,
  onGenerate,
}: BulkVariantGeneratorProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [defaultStock, setDefaultStock] = useState<number>(50);
  const [defaultPrice, setDefaultPrice] = useState<string>("");

  // Debug: Log props when dialog opens
  if (process.env.NODE_ENV === 'development' && open) {
    console.log('[BulkVariantGenerator] Props:', {
      variantTypes,
      variantOptionsMap,
      variantTypesCount: variantTypes.length,
      optionsMapKeys: Object.keys(variantOptionsMap),
    });
  }

  // Calculate how many variants will be generated
  const variantCount = useMemo(() => {
    const optionCounts = variantTypes.map(vt => {
      const selected = selectedOptions[vt.slug] || [];
      return selected.length > 0 ? selected.length : 0;
    });
    
    if (optionCounts.some(count => count === 0)) return 0;
    
    return optionCounts.reduce((acc, count) => acc * count, 1);
  }, [selectedOptions, variantTypes]);

  // Toggle option selection
  const toggleOption = (variantTypeSlug: string, optionValue: string) => {
    console.log('[BulkVariantGenerator] toggleOption called:', { variantTypeSlug, optionValue });
    setSelectedOptions(prev => {
      const current = prev[variantTypeSlug] || [];
      const isSelected = current.includes(optionValue);
      
      const newState = {
        ...prev,
        [variantTypeSlug]: isSelected
          ? current.filter(v => v !== optionValue)
          : [...current, optionValue],
      };
      
      console.log('[BulkVariantGenerator] Selection updated:', {
        variantTypeSlug,
        wasSelected: isSelected,
        newSelection: newState[variantTypeSlug],
      });
      
      return newState;
    });
  };

  // Select all options for a variant type
  const selectAll = (variantTypeSlug: string) => {
    const options = variantOptionsMap[variantTypeSlug] || [];
    const allValues = options.map(opt => typeof opt === 'string' ? opt : opt.value);
    setSelectedOptions(prev => ({
      ...prev,
      [variantTypeSlug]: allValues,
    }));
  };

  // Deselect all options for a variant type
  const deselectAll = (variantTypeSlug: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [variantTypeSlug]: [],
    }));
  };

  // Generate variants
  const handleGenerate = () => {
    // Validate that at least one option is selected for each variant type
    const missingTypes = variantTypes.filter(vt => {
      const selected = selectedOptions[vt.slug] || [];
      return selected.length === 0;
    });

    if (missingTypes.length > 0) {
      toast.error(`Please select at least one option for: ${missingTypes.map(vt => vt.name).join(", ")}`);
      return;
    }

    if (variantCount === 0) {
      toast.error("Please select at least one option for each variant type");
      return;
    }

    if (variantCount > 100) {
      toast.error(`Too many variants (${variantCount}). Please select fewer options. Maximum is 100 variants.`);
      return;
    }

    // Generate all combinations
    const optionArrays = variantTypes.map(vt => {
      const selected = selectedOptions[vt.slug] || [];
      return selected;
    });

    const combinations = cartesianProduct(optionArrays);

    // Create variant objects
    const variants = combinations.map(combo => {
      const variantData: Record<string, string> = {};
      variantTypes.forEach((vt, index) => {
        variantData[vt.slug] = combo[index];
      });

      return {
        variantData,
        stock: defaultStock,
        price: defaultPrice ? parseFloat(defaultPrice) : undefined,
      };
    });

    onGenerate(variants);
    toast.success(`Generated ${variants.length} variants successfully!`);
    
    // Reset form
    setSelectedOptions({});
    setDefaultStock(50);
    setDefaultPrice("");
    onOpenChange(false);
  };

  // Reset form when dialog closes
  const handleClose = () => {
    setSelectedOptions({});
    setDefaultStock(50);
    setDefaultPrice("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Bulk Variant Generator
          </DialogTitle>
          <DialogDescription>
            Select options for each variant type to generate all combinations at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Variant Type Selection */}
          {variantTypes.map(variantType => {
            const options = variantOptionsMap[variantType.slug] || [];
            const selected = selectedOptions[variantType.slug] || [];
            const allSelected = selected.length === options.length && options.length > 0;

            return (
              <Card key={variantType.slug}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{variantType.name}</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => selectAll(variantType.slug)}
                        disabled={allSelected}
                      >
                        Select All
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => deselectAll(variantType.slug)}
                        disabled={selected.length === 0}
                      >
                        Deselect All
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    {selected.length} of {options.length} selected
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {options.length === 0 ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800">
                        No options available for {variantType.name}. Please add variant options in the admin panel.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {options.map((option, optIndex) => {
                        // Handle different option formats
                        let value: string;
                        let label: string;
                        let hexCode: string | undefined;

                        if (typeof option === 'string') {
                          value = option;
                          label = option;
                        } else if (option && typeof option === 'object') {
                          value = String(option.value || option.label || optIndex);
                          label = String(option.label || option.value || optIndex);
                          hexCode = option.hexCode;
                        } else {
                          // Fallback for unexpected formats
                          value = String(optIndex);
                          label = String(optIndex);
                        }

                        const isSelected = selected.includes(value);

                        // Debug log for first option
                        if (optIndex === 0 && process.env.NODE_ENV === 'development') {
                          console.log(`[BulkVariantGenerator] First option for ${variantType.name}:`, {
                            option,
                            value,
                            label,
                            isSelected,
                          });
                        }

                      return (
                        <div
                          key={value}
                          className="flex items-center space-x-2 p-2 rounded-md border hover:bg-gray-50 cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleOption(variantType.slug, value);
                          }}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              if (checked !== isSelected) {
                                toggleOption(variantType.slug, value);
                              }
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          />
                          <Label 
                            className="flex items-center gap-2 cursor-pointer flex-1"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleOption(variantType.slug, value);
                            }}
                          >
                            {hexCode && (
                              <div
                                className="w-4 h-4 rounded border border-gray-300"
                                style={{ backgroundColor: hexCode }}
                              />
                            )}
                            <span className="text-sm">{label}</span>
                          </Label>
                        </div>
                      );
                    })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Default Values */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Default Values</CardTitle>
              <CardDescription>
                These values will be applied to all generated variants. You can edit them individually after generation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="default-stock">Default Stock *</Label>
                <Input
                  id="default-stock"
                  type="number"
                  min="0"
                  value={defaultStock}
                  onChange={(e) => setDefaultStock(parseInt(e.target.value) || 0)}
                  placeholder="50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-price">Default Price (Optional)</Label>
                <Input
                  id="default-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={defaultPrice}
                  onChange={(e) => setDefaultPrice(e.target.value)}
                  placeholder="29.99"
                />
                <p className="text-xs text-gray-500">
                  Leave empty to use the product base price
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">
                    {variantCount > 0 ? (
                      <>Will generate <strong>{variantCount}</strong> variant{variantCount !== 1 ? 's' : ''}</>
                    ) : (
                      "Select options to see how many variants will be generated"
                    )}
                  </p>
                  {variantCount > 50 && (
                    <p className="text-sm text-blue-700 mt-1">
                      ⚠️ Generating many variants may take a moment
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={variantCount === 0 || variantCount > 100}
          >
            <Zap className="h-4 w-4 mr-2" />
            Generate {variantCount > 0 ? `${variantCount} ` : ''}Variants
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
