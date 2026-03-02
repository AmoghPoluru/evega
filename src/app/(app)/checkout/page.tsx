import { redirect } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import { headers } from "next/headers";
import { CheckoutView } from "@/modules/checkout/ui/views/checkout-view";

export default async function CheckoutPage() {
  const headersList = await headers();
  const payload = await getPayload({ config });
  const session = await payload.auth({ headers: headersList });

  if (!session?.user) {
    redirect("/sign-in?redirect=/checkout");
  }

  return <CheckoutView />;
}
