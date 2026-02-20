"use client";

import { Clock } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VendorPendingApprovalPage() {
  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-6 w-6" />
            Request Pending
          </CardTitle>
          <CardDescription>
            Your vendor application is under review. We&apos;ll notify you once it&apos;s approved. This usually takes 1-2 business days.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            In the meantime, you can continue shopping. You&apos;ll receive an email when your vendor account is ready.
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Continue Shopping</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
