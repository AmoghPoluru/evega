import { redirect } from "next/navigation";

export default function VendorTemplatesPage() {
  redirect("/vendor/store-appearance?started=1&tab=style");
}
