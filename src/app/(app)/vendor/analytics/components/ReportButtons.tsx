"use client";

// Task 6.2: Report type selector buttons component
import { Button } from "@/components/ui/button";
import { Calendar, CalendarDays, CalendarRange } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportButtonsProps {
  selectedType: "daily" | "weekly" | "monthly";
  onSelectType: (type: "daily" | "weekly" | "monthly") => void;
}

export function ReportButtons({ selectedType, onSelectType }: ReportButtonsProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant={selectedType === "daily" ? "default" : "outline"}
        onClick={() => onSelectType("daily")}
        className={cn(
          "flex items-center gap-2",
          selectedType === "daily" && "bg-gray-900 text-white hover:bg-gray-800"
        )}
      >
        <Calendar className="h-4 w-4" />
        Daily Report
      </Button>
      <Button
        variant={selectedType === "weekly" ? "default" : "outline"}
        onClick={() => onSelectType("weekly")}
        className={cn(
          "flex items-center gap-2",
          selectedType === "weekly" && "bg-gray-900 text-white hover:bg-gray-800"
        )}
      >
        <CalendarDays className="h-4 w-4" />
        Weekly Report
      </Button>
      <Button
        variant={selectedType === "monthly" ? "default" : "outline"}
        onClick={() => onSelectType("monthly")}
        className={cn(
          "flex items-center gap-2",
          selectedType === "monthly" && "bg-gray-900 text-white hover:bg-gray-800"
        )}
      >
        <CalendarRange className="h-4 w-4" />
        Monthly Report
      </Button>
    </div>
  );
}
