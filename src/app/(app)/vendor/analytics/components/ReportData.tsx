"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Heart,
  Users,
  Activity,
} from "lucide-react";
import type { VendorAnalyticsReport } from "@/lib/vendor-analytics/build-vendor-analytics-report";

interface ReportDataProps {
  reportData: VendorAnalyticsReport;
  reportType: "daily" | "weekly" | "monthly";
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

const periodLabel = (reportType: ReportDataProps["reportType"]) =>
  reportType === "daily" ? "Today" : reportType === "weekly" ? "This week" : "This month";

export function ReportData({ reportData, reportType }: ReportDataProps) {
  const { orders, inventory, engagement, customers, businessHealth } = reportData;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{orders.total}</div>
          <p className="mt-1 text-xs text-gray-600">{periodLabel(reportType)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New Likes</CardTitle>
          <Heart className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{engagement.likes}</div>
          <p className="mt-1 text-xs text-gray-600">{periodLabel(reportType)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Potential Customers</CardTitle>
          <Users className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{customers.potential}</div>
          <p className="mt-1 text-xs text-gray-600">In your customer list</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Business Health</CardTitle>
          <Activity className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{businessHealth.label}</div>
          <p className="mt-1 text-xs text-gray-600">{formatCurrency(businessHealth.netProfit)} net</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
          <TrendingUp className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{orders.completedOrders}</div>
          <p className="mt-1 text-xs text-gray-600">
            {formatCurrency(businessHealth.revenue)} from completed sales
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Open Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{orders.openOrders}</div>
          <p className="mt-1 text-xs text-gray-600">Pending, payment, or processing</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Awaiting Payment</CardTitle>
          <DollarSign className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{orders.awaitingPayment}</div>
          <p className="mt-1 text-xs text-gray-600">{periodLabel(reportType)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          <Package className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{inventory.totalProducts}</div>
          <div className="mt-2 flex gap-2">
            {inventory.lowStockCount > 0 && (
              <Badge variant="outline" className="border-yellow-600 text-yellow-600">
                {inventory.lowStockCount} low stock
              </Badge>
            )}
            {inventory.outOfStockCount > 0 && (
              <Badge variant="outline" className="border-red-600 text-red-600">
                {inventory.outOfStockCount} out of stock
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Order Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {Object.entries(orders.statusBreakdown).map(([status, count]) => (
              <Badge key={status} variant="outline">
                {status.replace(/_/g, " ")}: {count}
              </Badge>
            ))}
            {Object.keys(orders.statusBreakdown).length === 0 && (
              <p className="text-sm text-gray-600">No orders in this period</p>
            )}
          </div>
        </CardContent>
      </Card>

      {inventory.lowStockCount > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              Low Stock Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {inventory.lowStockProducts.length > 0 ? (
              <div className="space-y-2">
                {inventory.lowStockProducts.slice(0, 5).map((product, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{product.name}</span>
                    <Badge variant="outline" className="text-yellow-600">
                      {product.stock} left
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No low stock products</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
