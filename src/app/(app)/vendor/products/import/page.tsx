import { ProductImportView } from "../components/ProductImportView";

export default function ProductImportPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Import Products</h1>
        <p className="text-sm text-gray-600 mt-1">
          Upload a CSV file to bulk import products. All imported products will be saved as drafts.
        </p>
      </div>
      <ProductImportView />
    </div>
  );
}
