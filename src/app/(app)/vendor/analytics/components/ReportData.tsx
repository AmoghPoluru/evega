"use client";

// Task 6.11: Report data display component
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, ShoppingCart, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";

interface ReportDataProps {
  reportData: {
    orders: {
      total: number;
      revenue: number;
      averageOrderValue: number;
      statusBreakdown: {
        pending?: number;
        processing?: number;
        complete?: number;
        canceled?: number;
      };
      topProducts?: Array<{ name: string; revenue: number; quantity: number }>;
    };
    inventory: {
      totalProducts: number;
      lowStockCount: number;
      outOfStockCount: number;
      totalInventoryValue: number;
      lowStockProducts?: Array<{ name: string; stock: number }>;
    };
    dateRange: {
      start: string;
      end: string;
    };
  };
  reportType: "daily" | "weekly" | "monthly";
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function ReportData({ reportData, reportType }: ReportDataProps) {
  const { orders, inventory } = reportData;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Order Statistics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{orders.total}</div>
          <p className="text-xs text-gray-600 mt-1">
            {reportType === "daily" ? "Today" : reportType === "weekly" ? "This week" : "This month"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(orders.revenue)}</div>
          <p className="text-xs text-gray-600 mt-1">Average: {formatCurrency(orders.averageOrderValue)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
          <TrendingUp className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(orders.averageOrderValue)}</div>
          <p className="text-xs text-gray-600 mt-1">Per order</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          <Package className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{inventory.totalProducts}</div>
          <div className="flex gap-2 mt-2">
            {inventory.lowStockCount > 0 && (
              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                {inventory.lowStockCount} low stock
              </Badge>
            )}
            {inventory.outOfStockCount > 0 && (
              <Badge variant="outline" className="text-red-600 border-red-600">
                {inventory.outOfStockCount} out of stock
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Breakdown */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Order Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            {orders.statusBreakdown.pending !== undefined && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  Pending: {orders.statusBreakdown.pending}
                </Badge>
              </div>
            )}
            {orders.statusBreakdown.processing !== undefined && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                  Processing: {orders.statusBreakdown.processing}
                </Badge>
              </div>
            )}
            {orders.statusBreakdown.complete !== undefined && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  Complete: {orders.statusBreakdown.complete}
                </Badge>
              </div>
            )}
            {orders.statusBreakdown.canceled !== undefined && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                  Canceled: {orders.statusBreakdown.canceled}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Inventory Alerts */}
      {inventory.lowStockCount > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              Low Stock Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {inventory.lowStockProducts && inventory.lowStockProducts.length > 0 ? (
              <div className="space-y-2">
                {inventory.lowStockProducts.slice(0, 5).map((product, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
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
