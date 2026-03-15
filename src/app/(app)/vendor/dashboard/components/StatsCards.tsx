'use client';

import { trpc } from '@/trpc/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, ShoppingCart, DollarSign, Clock } from 'lucide-react';

export function StatsCards() {
  const { data: stats, isLoading } = trpc.vendor.dashboard.stats.useQuery();

  const statCards = [
    {
      title: 'Total Products',
      value: stats?.totalProducts?.toString() || '0',
      icon: Package,
      description: 'Active products in your store',
      isLoading,
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders?.toString() || '0',
      icon: ShoppingCart,
      description: 'Orders received',
      isLoading,
    },
    {
      title: 'Revenue',
      value: stats?.totalRevenue
        ? `$${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : '$0.00',
      icon: DollarSign,
      description: 'Total earnings',
      isLoading,
    },
    {
      title: 'Pending Orders',
      value: stats?.pendingOrders?.toString() || '0',
      icon: Clock,
      description: 'Orders awaiting fulfillment',
      isLoading,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <CardDescription className="text-xs">{stat.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {stat.isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-gray-400" />
                  <p className="text-2xl font-semibold">{stat.value}</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
