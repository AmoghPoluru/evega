"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { toast } from "sonner";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, FileText, CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface ImportError {
  row: number;
  errors: string[];
}

interface ImportResult {
  success: number;
  failed: number;
  errors: ImportError[];
  productIds: string[];
}

export function ProductImportView() {
  const router = useRouter();
  const [csvData, setCsvData] = useState<string | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const queryClient = trpc.useUtils();

  const bulkImport = trpc.vendor.products.bulkImport.useMutation({
    onSuccess: (result) => {
      setImportResult(result);
      // Invalidate products list to refresh
      queryClient.vendor.products.list.invalidate();
      if (result.success > 0) {
        toast.success(`Successfully imported ${result.success} products`);
        // Redirect to drafts view to see imported products
        setTimeout(() => {
          window.location.href = "/vendor/products?status=draft";
        }, 2000);
      }
      if (result.failed > 0) {
        toast.error(`${result.failed} products failed to import`);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to import products");
    },
  });

  const downloadTemplate = useCallback(async () => {
    try {
      // Fetch the comprehensive template from public folder
      const response = await fetch("/sample-products-import.csv");
      if (response.ok) {
        const csvContent = await response.text();
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "sample-products-import.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("Template downloaded successfully");
      } else {
        // Fallback to inline template if file not found
        throw new Error("Template file not found");
      }
    } catch (error) {
      // Fallback template with proper format
      const template = `name,price,category,subcategory,description,size,color,variant_stock,variant_price,SKU,refundPolicy,tags
"Kanchipuram Silk Saree - Traditional Red","899.99","Sarees","Kanchipuram Silk","Exquisite handwoven Kanchipuram silk saree with intricate zari work. Perfect for weddings and special occasions.","","","15","","SKU-SAR-KAN-001","30-day","silk,traditional,wedding,premium"
"Bridal Lehenga - Heavy Embroidered Red","3499.99","Lehengas","Heavy Embroidered","Stunning bridal lehenga with heavy embroidery. Perfect for your special day.","S","Red","20","3499.99","SKU-LEH-HE-RED-S","30-day","bridal,heavy-embroidered,wedding"
"Bridal Lehenga - Heavy Embroidered Red","3499.99","Lehengas","Heavy Embroidered","Stunning bridal lehenga with heavy embroidery. Perfect for your special day.","M","Red","15","3499.99","SKU-LEH-HE-RED-M","30-day","bridal,heavy-embroidered,wedding"
"Embroidered Belt","149.99","Accessories","Embroidered Belts","Beautiful embroidered belt. Perfect for traditional wear.","","","25","","SKU-ACC-BELT-EMB","30-day","belt,embroidered,traditional"
"Gift Set - Premium","499.99","Miscellaneous & Other Items","Gift Sets","Beautiful premium gift set. Perfect for gifting.","","","10","","SKU-MIS-GIFT-SET","30-day","gift-set,premium,gifting"`;

      const blob = new Blob([template], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "product-import-template.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Template downloaded successfully");
    }
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvData(text);

      // Parse and preview first 5 rows
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data.slice(0, 5);
          setPreview(data);
          setIsValidating(true);

          // Validate required fields
          const requiredFields = ["name", "price", "category"];
          const headers = results.meta.fields || [];
          const missingFields = requiredFields.filter((field) => !headers.includes(field));

          if (missingFields.length > 0) {
            toast.error(`Missing required columns: ${missingFields.join(", ")}`);
            setIsValidating(false);
            return;
          }

          // Validate first few rows
          const errors: string[] = [];
          data.forEach((row: any, index: number) => {
            if (!row.name || !row.price || !row.category) {
              errors.push(`Row ${index + 2}: Missing required fields (name, price, category)`);
            }
            const price = parseFloat(row.price);
            if (isNaN(price) || price <= 0) {
              errors.push(`Row ${index + 2}: Invalid price`);
            }
            // Validate variant_stock if provided
            if (row.variant_stock && row.variant_stock.trim() !== "") {
              const stock = parseInt(row.variant_stock, 10);
              if (isNaN(stock) || stock < 0) {
                errors.push(`Row ${index + 2}: Invalid variant_stock (must be >= 0)`);
              }
            }
            // Validate variant_price if provided
            if (row.variant_price && row.variant_price.trim() !== "") {
              const variantPrice = parseFloat(row.variant_price);
              if (isNaN(variantPrice) || variantPrice <= 0) {
                errors.push(`Row ${index + 2}: Invalid variant_price (must be > 0)`);
              }
            }
          });

          if (errors.length > 0) {
            toast.warning(`Found ${errors.length} validation errors in preview`);
          } else {
            toast.success("CSV file looks good! Click Import to proceed.");
          }
          setIsValidating(false);
        },
        error: (error: any) => {
          toast.error(`Error parsing CSV: ${error.message}`);
          setIsValidating(false);
        },
      });
    };
    reader.readAsText(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    maxFiles: 1,
  });

  const handleImport = () => {
    if (!csvData) {
      toast.error("Please upload a CSV file first");
      return;
    }

    bulkImport.mutate({ csvData });
  };

  const handleViewProducts = () => {
    router.push("/vendor/products?status=draft");
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Import Products</CardTitle>
          <CardDescription>
            Follow these steps to bulk import your products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Download the CSV template below (includes sample data for all categories)</li>
            <li>Fill in your product information (name, price, category are required)</li>
            <li><strong>For products with variants:</strong> Add multiple rows with same product name, different size/color, and variant_stock</li>
            <li><strong>For products without variants:</strong> Leave size/color empty, use variant_stock for inventory</li>
            <li><strong>Subcategories:</strong> Use leaf-level subcategories (categories with no children) - see category hierarchy diagram</li>
            <li>Upload your completed CSV file</li>
            <li>Review the preview and click Import</li>
            <li>Edit each product individually to add images and finalize</li>
          </ol>
          <div className="mt-4">
            <Button onClick={downloadTemplate} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
          <CardDescription>
            Drag and drop your CSV file or click to browse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-blue-600">Drop the CSV file here...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  Drag and drop a CSV file here, or click to select
                </p>
                <p className="text-sm text-gray-500">Max file size: 5MB</p>
              </div>
            )}
          </div>

          {csvData && (
            <div className="mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="h-4 w-4" />
                <span>File loaded successfully</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      {preview.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview (First 5 Rows)</CardTitle>
            <CardDescription>
              Review your data before importing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(preview[0] || {}).map((key) => (
                      <TableHead key={key}>{key}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.map((row, index) => (
                    <TableRow key={index}>
                      {Object.values(row).map((value: any, cellIndex) => (
                        <TableCell key={cellIndex} className="max-w-xs truncate">
                          {String(value || "")}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Button */}
      {csvData && !importResult && (
        <div className="flex justify-end">
          <Button
            onClick={handleImport}
            disabled={bulkImport.isPending || isValidating}
            size="lg"
          >
            {bulkImport.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import Products
              </>
            )}
          </Button>
        </div>
      )}

      {/* Results */}
      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle>Import Results</CardTitle>
            <CardDescription>
              Summary of your product import
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-medium">Success: {importResult.success}</span>
              </div>
              {importResult.failed > 0 && (
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="font-medium">Failed: {importResult.failed}</span>
                </div>
              )}
            </div>

            {importResult.errors.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Errors:</h4>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {importResult.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-600">
                      Row {error.row}: {error.errors.join(", ")}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {importResult.success > 0 && (
              <div className="flex gap-2">
                <Button onClick={handleViewProducts}>
                  View Imported Products
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCsvData(null);
                    setPreview([]);
                    setImportResult(null);
                  }}
                >
                  Import Another File
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
