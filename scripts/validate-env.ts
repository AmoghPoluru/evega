#!/usr/bin/env tsx
/**
 * Environment Variable Validation Script
 * 
 * Validates that all required environment variables are set for production.
 * Run this before deploying to production.
 * 
 * Usage:
 *   NODE_ENV=production tsx scripts/validate-env.ts
 */

const requiredEnvVars = {
  // Database
  DATABASE_URL: {
    required: true,
    description: 'MongoDB connection string',
    validate: (value: string) => value.startsWith('mongodb://') || value.startsWith('mongodb+srv://'),
  },
  
  // Payload CMS
  PAYLOAD_SECRET: {
    required: true,
    description: 'Payload CMS secret key (min 32 characters)',
    validate: (value: string) => value.length >= 32,
  },
  
  // Application URLs
  NEXT_PUBLIC_APP_URL: {
    required: true,
    description: 'Public application URL',
    validate: (value: string) => value.startsWith('http://') || value.startsWith('https://'),
  },
  
  // NextAuth
  NEXTAUTH_SECRET: {
    required: true,
    description: 'NextAuth secret key (min 32 characters)',
    validate: (value: string) => value.length >= 32,
  },
  NEXTAUTH_URL: {
    required: true,
    description: 'NextAuth URL (should match NEXT_PUBLIC_APP_URL)',
    validate: (value: string) => value.startsWith('http://') || value.startsWith('https://'),
  },
  
  // Stripe
  STRIPE_SECRET_KEY: {
    required: true,
    description: 'Stripe secret key',
    validate: (value: string) => value.startsWith('sk_live_') || value.startsWith('sk_test_'),
  },
  STRIPE_WEBHOOK_SECRET: {
    required: true,
    description: 'Stripe webhook secret',
    validate: (value: string) => value.startsWith('whsec_'),
  },
};

const optionalEnvVars = {
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'Stripe publishable key (for client-side)',
  STRIPE_CONNECT_CLIENT_ID: 'Stripe Connect OAuth client ID (for vendor onboarding)',
  STRIPE_PLATFORM_ACCOUNT_ID: 'Stripe platform account ID (optional)',
  PLATFORM_COMMISSION_RATE: 'Default platform commission rate (%) - defaults to 10',
  GOOGLE_CLIENT_ID: 'Google OAuth client ID (optional)',
  GOOGLE_CLIENT_SECRET: 'Google OAuth client secret (optional)',
  FACEBOOK_CLIENT_ID: 'Facebook OAuth app ID (optional)',
  FACEBOOK_CLIENT_SECRET: 'Facebook OAuth app secret (optional)',
  SENDGRID_API_KEY: 'SendGrid API key (for email)',
  SENDGRID_FROM_EMAIL: 'SendGrid from email address',
  NEXT_PUBLIC_SENTRY_DSN: 'Sentry DSN for error tracking',
  SENTRY_ENVIRONMENT: 'Sentry environment name',
  OPENAI_API_KEY: 'OpenAI API key (for AI features)',
  NEXT_PUBLIC_ROOT_DOMAIN: 'Root domain for cookies',
};

function validateEnvironment() {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  console.log('🔍 Validating environment variables...\n');
  
  // Check required variables
  for (const [key, config] of Object.entries(requiredEnvVars)) {
    const value = process.env[key];
    
    if (!value) {
      if (config.required) {
        errors.push(`❌ Missing required: ${key} - ${config.description}`);
      }
    } else if (config.validate && !config.validate(value)) {
      errors.push(`❌ Invalid format: ${key} - ${config.description}`);
    } else {
      console.log(`✅ ${key}: Set`);
    }
  }
  
  // Check optional variables
  for (const [key, description] of Object.entries(optionalEnvVars)) {
    const value = process.env[key];
    if (!value) {
      warnings.push(`⚠️  Optional: ${key} - ${description} (not set)`);
    } else {
      console.log(`✅ ${key}: Set`);
    }
  }
  
  // Validate URL consistency
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  
  if (appUrl && nextAuthUrl && appUrl !== nextAuthUrl) {
    warnings.push(`⚠️  NEXT_PUBLIC_APP_URL (${appUrl}) and NEXTAUTH_URL (${nextAuthUrl}) should match`);
  }
  
  // Check for production-specific values
  if (process.env.NODE_ENV === 'production') {
    if (process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) {
      warnings.push('⚠️  Using Stripe test key in production environment');
    }
    
    if (process.env.DATABASE_URL?.includes('localhost')) {
      warnings.push('⚠️  Using localhost database in production environment');
    }
  }
  
  console.log('\n');
  
  if (warnings.length > 0) {
    console.log('⚠️  Warnings:');
    warnings.forEach(warning => console.log(`   ${warning}`));
    console.log('');
  }
  
  if (errors.length > 0) {
    console.log('❌ Validation failed:');
    errors.forEach(error => console.log(`   ${error}`));
    console.log('\n💡 See .env.production.example for required variables');
    process.exit(1);
  }
  
  console.log('✅ All required environment variables are valid!');
  process.exit(0);
}

validateEnvironment();
