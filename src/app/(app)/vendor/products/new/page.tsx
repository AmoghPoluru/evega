import { ProductForm } from "../components/ProductForm";

export default function NewProductPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Create New Product</h1>
        <p className="text-sm text-gray-600 mt-1">
          Add a new product to your catalog
        </p>
      </div>
      <ProductForm />
    </div>
  );
}
