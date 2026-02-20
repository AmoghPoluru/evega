import { redirect } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import { headers } from "next/headers";
import { OrdersView } from "@/modules/orders/ui/views/orders-view";

export default async function OrdersPage() {
  const headersList = await headers();
  const payload = await getPayload({ config });
  const user = await payload.auth({ headers: headersList });

  if (!user?.user) {
    redirect("/sign-in?redirect=/orders");
  }

  return <OrdersView userId={user.user.id} />;
}
