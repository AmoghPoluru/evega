import { getTimeOfDayGreeting } from "@/lib/vendor-greeting";
import { vendorPageTitles } from "@/lib/vendor-portal-labels";

type DashboardGreetingProps = {
  vendorName: string;
};

export function DashboardGreeting({ vendorName }: DashboardGreetingProps) {
  const greeting = getTimeOfDayGreeting();

  return (
    <div className="mb-2">
      <h1 className="text-2xl font-semibold text-foreground">{vendorPageTitles.dashboard}</h1>
      <p className="text-sm text-muted-foreground mt-1">
        {greeting}, {vendorName}! Here&apos;s what&apos;s happening with your store today.
      </p>
    </div>
  );
}
