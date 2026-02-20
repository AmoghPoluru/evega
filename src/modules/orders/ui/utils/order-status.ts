export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "Pending",
    payment_done: "Payment Done",
    processing: "Processing",
    complete: "Complete",
    canceled: "Canceled",
    refunded: "Refunded",
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    payment_done: "bg-blue-100 text-blue-800",
    processing: "bg-purple-100 text-purple-800",
    complete: "bg-green-100 text-green-800",
    canceled: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}
