import { redirect } from "next/navigation";
import { getCachedSession } from "@/lib/auth-server";
import { OrdersView } from "@/modules/orders/ui/views/orders-view";

export default async function OrdersPage() {
  const session = await getCachedSession();

  if (!session?.user) {
    redirect("/sign-in?redirect=/orders");
  }

  return <OrdersView userId={session.user.id} />;
}
