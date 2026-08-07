import { ProductImportView } from "../components/ProductImportView";
import { vendorPageTitles } from "@/lib/vendor-portal-labels";

export default function ProductImportPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">{vendorPageTitles.importProducts}</h1>
        <p className="text-sm text-gray-600 mt-1">
          Upload a CSV file to bulk import products. All imported products will be saved as drafts.
        </p>
      </div>
      <ProductImportView />
    </div>
  );
}
