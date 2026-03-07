"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle, ExternalLink, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function StripeOnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const refresh = searchParams.get("refresh");

  const [isCreating, setIsCreating] = useState(false);

  const { data: accountStatus, isLoading, refetch, error: statusError } = trpc.vendor.getStripeAccountStatus.useQuery(undefined, {
    retry: false,
  });
  const createAccount = trpc.vendor.createStripeAccount.useMutation();
  const refreshLink = trpc.vendor.refreshOnboardingLink.useMutation();

  useEffect(() => {
    if (success === "true") {
      // Refetch status after successful onboarding
      refetch();
      toast.success("Stripe onboarding completed! Your account is being verified.");
    }
    if (refresh === "true") {
      toast.info("Please complete the onboarding process to continue.");
    }
  }, [success, refresh, refetch]);

  const handleCreateAccount = async () => {
    setIsCreating(true);
    try {
      const result = await createAccount.mutateAsync();
      if (result.onboardingLink) {
        // Redirect to Stripe onboarding
        window.location.href = result.onboardingLink;
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to create Stripe account";
      
      // If Stripe Connect is not enabled, show special message with link
      if (errorMessage.includes("Stripe Connect is not enabled") || 
          errorMessage.includes("signed up for Connect")) {
        toast.error(
          "Stripe Connect needs to be enabled first. Click here to set it up.",
          {
            duration: 15000,
            action: {
              label: "Enable Connect",
              onClick: () => {
                window.open("https://dashboard.stripe.com/connect", "_blank");
              },
            },
          }
        );
      } else {
        toast.error(errorMessage, {
          duration: 10000,
        });
      }
      
      setIsCreating(false);
    }
  };

  const handleContinueOnboarding = () => {
    if (accountStatus?.connected && accountStatus.accountId) {
      // Refresh the onboarding link
      refreshLink.mutate(
        undefined,
        {
          onSuccess: (data) => {
            if (data.onboardingLink) {
              window.location.href = data.onboardingLink;
            }
          },
          onError: (error: any) => {
            toast.error(error.message || "Failed to refresh onboarding link");
          },
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle error state
  if (statusError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Unable to load Stripe account status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-red-500 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {statusError.message || "An error occurred while loading your Stripe account status."}
              </AlertDescription>
            </Alert>
            {statusError.data?.code === "FORBIDDEN" && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  This page requires an approved vendor account. Please ensure:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Your vendor account is approved</li>
                  <li>Your vendor account is active</li>
                  <li>You are logged in with the correct account</li>
                </ul>
                <Button
                  onClick={() => router.push("/vendor/dashboard")}
                  variant="outline"
                  className="mt-4"
                >
                  Go to Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Stripe Account Setup</CardTitle>
          <CardDescription>
            Connect your Stripe account to receive payments directly. You'll need to complete
            Stripe's onboarding process to start receiving payouts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!accountStatus || !accountStatus.connected ? (
            // Not connected
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  You need to connect a Stripe account to receive payments. This process takes
                  about 5-10 minutes.
                </AlertDescription>
              </Alert>

              {(createAccount.error?.message?.includes("Stripe Connect is not enabled") || 
                createAccount.error?.message?.includes("signed up for Connect")) && (
                <Alert className="border-yellow-500 bg-yellow-50">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800 space-y-3">
                    <div>
                      <strong>Stripe Connect Setup Required:</strong> Before vendors can connect their accounts, 
                      the platform needs to enable Stripe Connect in the Stripe Dashboard.
                    </div>
                    <Button
                      onClick={() => window.open("https://dashboard.stripe.com/connect", "_blank")}
                      variant="outline"
                      size="sm"
                      className="mt-2"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Enable Stripe Connect
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <h3 className="font-semibold">What you'll need:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Business information (name, address, tax ID)</li>
                  <li>Bank account details for payouts</li>
                  <li>Business verification documents (if required)</li>
                </ul>
              </div>

              <Button
                onClick={handleCreateAccount}
                disabled={isCreating}
                className="w-full"
                size="lg"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Connect Stripe Account
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          ) : accountStatus.isReady ? (
            // Account is ready
            <div className="space-y-4">
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Your Stripe account is active and ready to receive payments!
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Account Status:</span>
                  <span className="text-sm text-green-600 capitalize">{accountStatus.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Charges Enabled:</span>
                  <span className="text-sm">{accountStatus.chargesEnabled ? "Yes" : "No"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Payouts Enabled:</span>
                  <span className="text-sm">{accountStatus.payoutsEnabled ? "Yes" : "No"}</span>
                </div>
              </div>

              <Button
                onClick={() => router.push("/vendor/dashboard")}
                className="w-full"
                variant="outline"
              >
                Go to Dashboard
              </Button>
            </div>
          ) : accountStatus.status === "pending" ? (
            // Pending onboarding
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  Your Stripe account is being set up. Please complete the onboarding process to
                  start receiving payments.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <span className="text-sm text-yellow-600 capitalize">{accountStatus.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Onboarding Completed:</span>
                  <span className="text-sm">
                    {accountStatus.onboardingCompleted ? "Yes" : "No"}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleContinueOnboarding}
                disabled={refreshLink.isPending}
                className="w-full"
                size="lg"
              >
                {refreshLink.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Continue Onboarding
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          ) : accountStatus.status === "restricted" || accountStatus.status === "rejected" ? (
            // Restricted or rejected
            <div className="space-y-4">
              <Alert className="border-red-500 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Your Stripe account has been {accountStatus.status}. Please contact support or
                  try completing the onboarding process again.
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleContinueOnboarding}
                disabled={refreshLink.isPending}
                className="w-full"
                variant="outline"
              >
                {refreshLink.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry Onboarding
                  </>
                )}
              </Button>
            </div>
          ) : null}

          {accountStatus?.error && (
            <Alert className="border-red-500 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{accountStatus.error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
