"use client";

// Task 6.9: Report summary display component
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ReportSummaryProps {
  summary: string | null;
  reportType: "daily" | "weekly" | "monthly";
  onRegenerate: () => void;
  isLoading?: boolean;
}

export function ReportSummary({ summary, reportType, onRegenerate, isLoading }: ReportSummaryProps) {
  const reportTypeLabel = reportType === "daily" ? "Daily" : reportType === "weekly" ? "Weekly" : "Monthly";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gray-600" />
            <CardTitle>{reportTypeLabel} Summary</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            disabled={isLoading}
          >
            <RefreshCw className={isLoading ? "h-4 w-4 mr-2 animate-spin" : "h-4 w-4 mr-2"} />
            Regenerate
          </Button>
        </div>
        <CardDescription>
          AI-generated insights and recommendations for your {reportTypeLabel.toLowerCase()} performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : summary ? (
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">{summary}</p>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No summary available</p>
        )}
      </CardContent>
    </Card>
  );
}
