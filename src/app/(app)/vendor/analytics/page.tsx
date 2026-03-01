"use client";

// Task 6.1: Analytics page as client component
import { useState } from "react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Loader2 } from "lucide-react";
import { ReportButtons } from "./components/ReportButtons";
import { ReportSummary } from "./components/ReportSummary";
import { ReportData } from "./components/ReportData";

export default function VendorAnalyticsPage() {
  // Task 6.2: Store selected report type in component state
  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly">("daily");
  const [shouldFetch, setShouldFetch] = useState(false);

  // Task 6.3-6.5: Fetch report data only when button is clicked
  const dailyQuery = trpc.vendor.analytics.getDailyReport.useQuery(
    undefined,
    { enabled: reportType === "daily" && shouldFetch }
  );
  const weeklyQuery = trpc.vendor.analytics.getWeeklyReport.useQuery(
    undefined,
    { enabled: reportType === "weekly" && shouldFetch }
  );
  const monthlyQuery = trpc.vendor.analytics.getMonthlyReport.useQuery(
    undefined,
    { enabled: reportType === "monthly" && shouldFetch }
  );

  // Get active query data
  const reportData = reportType === "daily" 
    ? dailyQuery.data 
    : reportType === "weekly" 
    ? weeklyQuery.data 
    : monthlyQuery.data;

  // Task 6.6: Generate summary when report data is available
  const summaryQuery = trpc.vendor.analytics.generateSummary.useQuery(
    { reportType, reportData: reportData! },
    { enabled: !!reportData && shouldFetch }
  );

  // Determine which query is active
  const activeQuery = reportType === "daily" ? dailyQuery : reportType === "weekly" ? weeklyQuery : monthlyQuery;
  const isLoading = activeQuery.isLoading || (reportData && summaryQuery.isLoading);
  const error = activeQuery.error || summaryQuery.error;

  // Handle generate button click
  const handleGenerate = () => {
    setShouldFetch(true);
  };

  // Reset when report type changes
  const handleReportTypeChange = (type: "daily" | "weekly" | "monthly") => {
    setReportType(type);
    setShouldFetch(false);
  };

  // Task 6.1.5: Error state
  if (error && shouldFetch) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-6 w-6 text-gray-600" />
            <h1 className="text-2xl font-semibold text-gray-900">Analytics & Reports</h1>
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
            <Button onClick={() => {
              setShouldFetch(false);
              setTimeout(() => setShouldFetch(true), 100);
            }}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Task 6.1.3: Page title and description */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-6 w-6 text-gray-600" />
          <h1 className="text-2xl font-semibold text-gray-900">Analytics & Reports</h1>
        </div>
        <p className="text-sm text-gray-600">
          View your business insights and performance metrics
        </p>
      </div>

      {/* Task 6.2: Report type selector buttons */}
      <div className="mb-6">
        <ReportButtons
          selectedType={reportType}
          onSelectType={handleReportTypeChange}
        />
      </div>

      {/* Generate Report Button */}
      {!shouldFetch && (
        <div className="mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Generate {reportType === "daily" ? "Daily" : reportType === "weekly" ? "Weekly" : "Monthly"} Report
                </h3>
                <p className="text-sm text-gray-600 mb-6 text-center max-w-md">
                  Click the button below to generate an AI-powered analytics report with insights and recommendations.
                </p>
                <Button
                  onClick={handleGenerate}
                  size="lg"
                  className="bg-gray-900 hover:bg-gray-800"
                >
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading state */}
      {isLoading && shouldFetch && (
        <div className="mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 text-gray-600 animate-spin mb-4" />
                <p className="text-sm text-gray-600">
                  Generating report and AI summary...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Task 6.11: Report data display */}
      {reportData && !isLoading && (
        <div className="mb-6">
          <ReportData reportData={reportData} reportType={reportType} />
        </div>
      )}

      {/* Task 6.9: Report summary display */}
      {reportData && !isLoading && (
        <div className="mb-6">
          <ReportSummary
            summary={summaryQuery.data?.summary || null}
            reportType={reportType}
            isLoading={summaryQuery.isLoading}
            onRegenerate={() => {
              // Invalidate and refetch summary
              summaryQuery.refetch();
            }}
          />
        </div>
      )}
    </div>
  );
}
