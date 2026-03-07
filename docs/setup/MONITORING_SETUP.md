# Monitoring & Error Tracking Setup Guide

This guide covers setting up Sentry for error tracking and monitoring in the Evega project.

## Overview

Sentry provides:
- **Error Tracking**: Automatic error capture and reporting
- **Performance Monitoring**: Track API response times and page loads
- **Session Replay**: Record user sessions for debugging
- **Release Tracking**: Track errors by deployment version

## Setup Instructions

### 1. Create Sentry Project

1. Go to [Sentry.io](https://sentry.io) and sign up/login
2. Create a new project
3. Select **Next.js** as the platform
4. Copy your **DSN** (Data Source Name)

### 2. Configure Environment Variables

Add to your `.env.local` (development) and `.env.production`:

```bash
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=production  # or staging, development
```

### 3. Initialize Sentry

Sentry is already configured in:
- `sentry.client.config.ts` - Client-side error tracking
- `sentry.server.config.ts` - Server-side error tracking
- `sentry.edge.config.ts` - Edge runtime error tracking

### 4. Error Boundaries

Error boundaries are set up in:
- `src/components/error-boundary.tsx` - React error boundary component
- `src/app/layout.tsx` - Root layout with error boundary

## Features

### Automatic Error Capture

Sentry automatically captures:
- Unhandled exceptions
- Unhandled promise rejections
- React component errors (via error boundary)
- API route errors
- tRPC procedure errors

### Manual Error Reporting

You can manually report errors:

```typescript
import * as Sentry from "@sentry/nextjs";

try {
  // Your code
} catch (error) {
  Sentry.captureException(error);
  throw error;
}
```

### Adding Context

Add user context:

```typescript
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
});
```

Add tags:

```typescript
Sentry.setTag("order_id", orderId);
Sentry.setTag("vendor_id", vendorId);
```

### Performance Monitoring

Sentry automatically tracks:
- API route performance
- Page load times
- Database query times

## Error Boundary Usage

Wrap components that might error:

```tsx
import { ErrorBoundary } from "@/components/error-boundary";

<ErrorBoundary fallback={<CustomErrorUI />}>
  <YourComponent />
</ErrorBoundary>
```

## tRPC Error Logging

tRPC errors are automatically captured. To add custom logging:

```typescript
// In tRPC procedure
try {
  // Your code
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      procedure: "checkout.purchase",
    },
    extra: {
      userId: ctx.user?.id,
    },
  });
  throw error;
}
```

## Monitoring Dashboard

Access your Sentry dashboard to:
- View error trends
- See error details and stack traces
- Track error frequency
- View performance metrics
- Review session replays

## Alerts

Configure alerts in Sentry:
1. Go to **Alerts** in Sentry dashboard
2. Create alert rules for:
   - New errors
   - Error rate spikes
   - Performance degradation
3. Set up notifications (email, Slack, etc.)

## Best Practices

1. **Don't log sensitive data** - Avoid logging passwords, tokens, etc.
2. **Use appropriate log levels** - Use `captureException` for errors, `captureMessage` for warnings
3. **Add context** - Include user info, request details, etc.
4. **Filter noise** - Configure filters to ignore expected errors
5. **Monitor regularly** - Check Sentry dashboard daily

## Troubleshooting

### Errors Not Appearing
- Verify DSN is correct
- Check environment variable is set
- Verify Sentry is initialized
- Check browser console for Sentry errors

### Too Many Errors
- Configure filters in Sentry
- Adjust sampling rates
- Review and fix common errors

### Performance Impact
- Adjust `tracesSampleRate` (currently 1.0 = 100%)
- Reduce `replaysSessionSampleRate` if needed
- Disable session replay in production if not needed
