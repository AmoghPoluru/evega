# CI/CD Pipeline Setup Guide

This guide covers the GitHub Actions CI/CD pipeline configuration for the Evega project.

## Overview

The CI/CD pipeline includes:
- **CI Workflow**: Runs tests and builds on every push/PR
- **Deploy Workflow**: Deploys to staging and production

## Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Jobs:**
1. **Test Job**
   - Runs linter
   - Runs unit tests
   - Runs E2E tests
   - Uses MongoDB service container

2. **Build Job**
   - Builds the application
   - Uploads build artifacts
   - Only runs if tests pass

### 2. Deploy Workflow (`.github/workflows/deploy.yml`)

**Triggers:**
- Push to `main` branch
- Manual workflow dispatch

**Jobs:**
1. **Deploy Staging**
   - Builds with staging environment variables
   - Deploys to Vercel staging environment
   - Runs automatically on push to `main`

2. **Deploy Production**
   - Validates production environment variables
   - Builds with production environment variables
   - Deploys to Vercel production environment
   - Requires staging deployment to succeed first

## Required GitHub Secrets

### For CI Workflow
- No secrets required (uses test values)

### For Deploy Workflow

#### Staging Secrets
- `STAGING_DATABASE_URL`
- `STAGING_PAYLOAD_SECRET`
- `STAGING_NEXTAUTH_SECRET`
- `STAGING_APP_URL`
- `STAGING_STRIPE_SECRET_KEY`
- `STAGING_STRIPE_WEBHOOK_SECRET`

#### Production Secrets
- `DATABASE_URL`
- `PAYLOAD_SECRET`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `NEXTAUTH_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

#### Vercel Secrets
- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID

## Setup Instructions

### 1. Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Add all required secrets listed above

### 2. Get Vercel Credentials

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Go to **Settings** > **Tokens**
3. Create a new token and copy it
4. Go to **Settings** > **General** to find Organization ID and Project ID

### 3. Configure Environments

1. In GitHub, go to **Settings** > **Environments**
2. Create `staging` and `production` environments
3. Add environment-specific secrets to each environment
4. Configure protection rules (optional):
   - Require reviewers for production
   - Restrict which branches can deploy

### 4. Test the Pipeline

1. Create a test branch
2. Push changes to trigger CI workflow
3. Verify tests pass
4. Merge to `main` to trigger deployment

## Deployment Platforms

### Vercel (Current)

The workflow uses Vercel for deployment. To use a different platform:

1. Replace the deploy step in `.github/workflows/deploy.yml`
2. Update secrets accordingly
3. Configure platform-specific deployment commands

### Alternative Platforms

- **Railway**: Use Railway CLI or API
- **Netlify**: Use Netlify CLI or API
- **AWS**: Use AWS CLI or CDK
- **Docker**: Build and push Docker images

## Monitoring

- Check workflow status in **Actions** tab
- Review deployment logs for errors
- Monitor Sentry for production errors
- Check Vercel dashboard for deployment status

## Troubleshooting

### Tests Failing
- Check MongoDB service is running
- Verify environment variables are set
- Review test logs for specific errors

### Build Failing
- Check for TypeScript errors
- Verify all dependencies are installed
- Review build logs for specific errors

### Deployment Failing
- Verify all secrets are set correctly
- Check Vercel credentials are valid
- Review deployment logs for errors

## Best Practices

1. **Never commit secrets** - Always use GitHub Secrets
2. **Test locally first** - Run tests before pushing
3. **Use feature branches** - Don't push directly to `main`
4. **Review deployments** - Use environment protection rules
5. **Monitor deployments** - Check Sentry and logs after deployment
