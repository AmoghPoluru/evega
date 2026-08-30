"use client";

import { OrderDetailError } from "./order-detail-states";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function OrderDetailErrorBoundary({ error, reset }: Props) {
  return <OrderDetailError message={error.message} onRetry={reset} />;
}
