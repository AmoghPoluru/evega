"use client";

import Image from "next/image";
import Link from "next/link";
import { Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProductSnapshotMetricId } from "@/lib/vendor-dashboard/product-snapshot";

export type ProductSnapshotTableRow = {
  productId: string;
  name: string;
  imageUrl: string | null;
  sold: number;
  liked: number;
  visited: number;
  favorited: number;
};

type ProductSnapshotTableProps = {
  rows: ProductSnapshotTableRow[];
  metric: ProductSnapshotMetricId;
  isLoading?: boolean;
};

function metricBadgeVariant(
  metric: ProductSnapshotMetricId,
  active: boolean,
): "default" | "secondary" | "outline" {
  if (!active) return "outline";
  switch (metric) {
    case "ordered":
      return "default";
    case "liked":
      return "secondary";
    default:
      return "outline";
  }
}

function MetricCell({
  value,
  metric,
  column,
}: {
  value: number;
  metric: ProductSnapshotMetricId;
  column: ProductSnapshotMetricId;
}) {
  const isActive = metric === column;
  return (
    <span className={isActive ? "font-semibold text-foreground" : "text-muted-foreground"}>
      {value.toLocaleString()}
    </span>
  );
}

export function ProductSnapshotTable({ rows, metric, isLoading }: ProductSnapshotTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          No products match this period and filter.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Product</TableHead>
            <TableHead className="text-right">
              Sold
              {metric === "ordered" ? (
                <Badge variant={metricBadgeVariant("ordered", true)} className="ml-2">
                  Sorted
                </Badge>
              ) : null}
            </TableHead>
            <TableHead className="text-right">
              Liked
              {metric === "liked" ? (
                <Badge variant={metricBadgeVariant("liked", true)} className="ml-2">
                  Sorted
                </Badge>
              ) : null}
            </TableHead>
            <TableHead className="text-right">
              Visited
              {metric === "visited" ? (
                <Badge variant={metricBadgeVariant("visited", true)} className="ml-2">
                  Sorted
                </Badge>
              ) : null}
            </TableHead>
            <TableHead className="text-right">
              Favorited
              {metric === "favorited" ? (
                <Badge variant={metricBadgeVariant("favorited", true)} className="ml-2">
                  Sorted
                </Badge>
              ) : null}
            </TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={row.productId}>
              <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-md bg-muted">
                    {row.imageUrl ? (
                      <Image
                        src={row.imageUrl}
                        alt={row.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : null}
                  </div>
                  <span className="font-medium">{row.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <MetricCell value={row.sold} metric={metric} column="ordered" />
              </TableCell>
              <TableCell className="text-right">
                <MetricCell value={row.liked} metric={metric} column="liked" />
              </TableCell>
              <TableCell className="text-right">
                <MetricCell value={row.visited} metric={metric} column="visited" />
              </TableCell>
              <TableCell className="text-right">
                <MetricCell value={row.favorited} metric={metric} column="favorited" />
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/vendor/products/${row.productId}/edit`}>
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Edit
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
