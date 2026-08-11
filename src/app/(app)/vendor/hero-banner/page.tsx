import { redirect } from "next/navigation";

export default function VendorHappyBannerPage() {
  redirect("/vendor/store-appearance?started=1&tab=banners");
}
