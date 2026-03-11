import { redirect } from "next/navigation";

/**
 * Route handler for category/subcategory/product URLs
 * 
 * This route redirects to the standard product page URL
 * Example: /indo-western/fusion-dresses/products/123 → /products/123
 * 
 * This maintains SEO-friendly URLs while using a single product page route
 */
interface Props {
  params: Promise<{
    category: string;
    subcategory: string;
    productId: string;
  }>;
}

export default async function CategorySubcategoryProductPage({ params }: Props) {
  const { productId } = await params;
  
  // Redirect to the standard product page route
  redirect(`/products/${productId}`);
}
