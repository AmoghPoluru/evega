import { redirect } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import { ProductForm } from "../../components/ProductForm";
import { requireVendor } from "@/lib/middleware/vendor-auth";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  
  console.log("[EDIT PAGE] Loading edit page for product ID:", id);

  try {
    // Ensure vendor is authenticated (this will redirect if not)
    const { vendor } = await requireVendor();
    
    // Use Payload directly for server-side access
    const payload = await getPayload({ config });
    
    console.log("[EDIT PAGE] Fetching product via Payload...");
    const product = await payload.findByID({
      collection: "products",
      id,
      depth: 2, // Load relationships (category, subcategory, tags, etc.)
    });

    console.log("[EDIT PAGE] Product fetched:", {
      id: product.id,
      name: product.name,
      productVendor: typeof product.vendor === "string" ? product.vendor : product.vendor?.id,
      sessionVendor: vendor.id,
    });

    // Verify ownership
    const productVendorId = typeof product.vendor === "string" 
      ? product.vendor 
      : product.vendor?.id;
    
    if (productVendorId !== vendor.id) {
      console.error("[EDIT PAGE] Access denied - vendor mismatch");
      redirect("/vendor/products");
    }

    console.log("[EDIT PAGE] Product access granted, rendering form");

    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Edit Product</h1>
          <p className="text-sm text-gray-600 mt-1">
            Update your product information
          </p>
        </div>
        <ProductForm product={product} />
      </div>
    );
  } catch (error: any) {
    console.error("[EDIT PAGE] Error loading product:", {
      error: error?.message || error,
      stack: error?.stack,
      id,
    });
    redirect("/vendor/products");
  }
}
