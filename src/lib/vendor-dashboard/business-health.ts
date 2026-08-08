export type BusinessHealthStatus = "profit" | "break_even" | "loss";

export function getBusinessHealth(netProfit: number): {
  status: BusinessHealthStatus;
  label: string;
} {
  if (netProfit > 0) {
    return { status: "profit", label: "In profit" };
  }

  if (netProfit < 0) {
    return { status: "loss", label: "At a loss" };
  }

  return { status: "break_even", label: "Break even" };
}

export function getBusinessHealthStyles(status: BusinessHealthStatus): {
  card: string;
  icon: string;
  value: string;
} {
  switch (status) {
    case "profit":
      return {
        card: "border-green-200 bg-green-50/50 hover:border-green-300 hover:bg-green-50",
        icon: "text-green-600",
        value: "text-green-700",
      };
    case "break_even":
      return {
        card: "border-yellow-200 bg-yellow-50/50 hover:border-yellow-300 hover:bg-yellow-50",
        icon: "text-yellow-600",
        value: "text-yellow-700",
      };
    case "loss":
      return {
        card: "border-red-200 bg-red-50/50 hover:border-red-300 hover:bg-red-50",
        icon: "text-red-600",
        value: "text-red-700",
      };
  }
}
