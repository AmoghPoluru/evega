"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Loader2 } from "lucide-react";
import { ReportButtons } from "./components/ReportButtons";
import { ReportSummary } from "./components/ReportSummary";
import { ReportData } from "./components/ReportData";
import { vendorPageTitles } from "@/lib/vendor-portal-labels";

export default function VendorAnalyticsPage() {
  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly">("daily");
  const [shouldFetch, setShouldFetch] = useState(false);

  const dailyQuery = trpc.vendor.analytics.getDailyReport.useQuery(undefined, {
    enabled: reportType === "daily" && shouldFetch,
  });
  const weeklyQuery = trpc.vendor.analytics.getWeeklyReport.useQuery(undefined, {
    enabled: reportType === "weekly" && shouldFetch,
  });
  const monthlyQuery = trpc.vendor.analytics.getMonthlyReport.useQuery(undefined, {
    enabled: reportType === "monthly" && shouldFetch,
  });

  const reportData =
    reportType === "daily"
      ? dailyQuery.data
      : reportType === "weekly"
        ? weeklyQuery.data
        : monthlyQuery.data;

  const activeQuery =
    reportType === "daily" ? dailyQuery : reportType === "weekly" ? weeklyQuery : monthlyQuery;
  const isLoading = activeQuery.isLoading;
  const error = activeQuery.error;

  const handleGenerate = () => {
    setShouldFetch(true);
  };

  const handleReportTypeChange = (type: "daily" | "weekly" | "monthly") => {
    setReportType(type);
    setShouldFetch(false);
  };

  if (error && shouldFetch) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-gray-600" />
            <h1 className="text-2xl font-semibold text-gray-900">{vendorPageTitles.analytics}</h1>
          </div>
          <p className="text-sm text-gray-600">
            View your business insights and performance metrics
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error.message || "Failed to load analytics data"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => {
                setShouldFetch(false);
                setTimeout(() => setShouldFetch(true), 100);
              }}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-gray-600" />
          <h1 className="text-2xl font-semibold text-gray-900">{vendorPageTitles.analytics}</h1>
        </div>
        <p className="text-sm text-gray-600">
          Plain-language summaries of orders, customers, likes, and business health
        </p>
      </div>

      <div className="mb-6">
        <ReportButtons selectedType={reportType} onSelectType={handleReportTypeChange} />
      </div>

      {!shouldFetch && (
        <div className="mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-8">
                <BarChart3 className="mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Generate {reportType === "daily" ? "Daily" : reportType === "weekly" ? "Weekly" : "Monthly"} Report
                </h3>
                <p className="mb-6 max-w-md text-center text-sm text-gray-600">
                  See a quick summary of your orders, likes, potential customers, payments, and business health for the selected period.
                </p>
                <Button onClick={handleGenerate} size="lg" className="bg-gray-900 hover:bg-gray-800">
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isLoading && shouldFetch && (
        <div className="mb-6 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="mb-4 h-8 w-8 animate-spin text-gray-600" />
                <p className="text-sm text-gray-600">Building your report...</p>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <Skeleton key={index} className="h-28 w-full" />
            ))}
          </div>
        </div>
      )}

      {reportData && !isLoading && (
        <>
          <div className="mb-6">
            <ReportSummary
              summary={reportData.summary}
              periodLabel={reportData.periodLabel}
              reportType={reportType}
            />
          </div>

          <div className="mb-6">
            <ReportData reportData={reportData} reportType={reportType} />
          </div>
        </>
      )}
    </div>
  );
}
