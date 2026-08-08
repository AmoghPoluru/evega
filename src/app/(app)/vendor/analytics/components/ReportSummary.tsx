"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

interface ReportSummaryProps {
  summary: string;
  periodLabel: string;
  reportType: "daily" | "weekly" | "monthly";
}

export function ReportSummary({ summary, periodLabel, reportType }: ReportSummaryProps) {
  const reportTypeLabel =
    reportType === "daily" ? "Daily" : reportType === "weekly" ? "Weekly" : "Monthly";

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          <CardTitle>{reportTypeLabel} Summary</CardTitle>
        </div>
        <CardDescription>{periodLabel}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-line leading-relaxed text-gray-800">{summary}</p>
      </CardContent>
    </Card>
  );
}
