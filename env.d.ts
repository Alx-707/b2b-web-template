/**
 * TypeScript declarations for env.mjs
 * This file provides type definitions for the environment configuration
 */

interface EnvVariables {
  // Database
  DATABASE_URL?: string;

  // Authentication
  NEXTAUTH_SECRET?: string;
  NEXTAUTH_URL?: string;

  // Email Service (Resend)
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  EMAIL_REPLY_TO?: string;

  // Data Storage (Airtable)
  AIRTABLE_API_KEY?: string;
  AIRTABLE_BASE_ID?: string;
  AIRTABLE_TABLE_NAME?: string;

  // Bot Protection (Cloudflare Turnstile)
  TURNSTILE_SECRET_KEY?: string;

  // AI Translation Service (Lingo.dev)
  LINGO_API_KEY?: string;
  LINGO_PROJECT_ID?: string;

  // Performance Monitoring (Sentry)
  SENTRY_DSN?: string;
  SENTRY_ORG?: string;
  SENTRY_PROJECT?: string;
  SENTRY_AUTH_TOKEN?: string;

  // Analytics & Monitoring
  VERCEL_ANALYTICS_ID?: string;
  GOOGLE_ANALYTICS_ID?: string;

  // Security & CSP
  CSP_REPORT_URI?: string;
  SECURITY_HEADERS_ENABLED?: string;

  // Development & Testing
  NODE_ENV: 'development' | 'production' | 'test';
  VERCEL_ENV?: 'development' | 'preview' | 'production';
  VERCEL_URL?: string;
  PORT?: string;

  // Public environment variables (prefixed with NEXT_PUBLIC_)
  NEXT_PUBLIC_APP_URL?: string;
  NEXT_PUBLIC_TURNSTILE_SITE_KEY?: string;
  NEXT_PUBLIC_SENTRY_DSN?: string;
  NEXT_PUBLIC_VERCEL_ANALYTICS_ID?: string;
  NEXT_PUBLIC_GOOGLE_ANALYTICS_ID?: string;
  NEXT_PUBLIC_APP_ENV?: 'development' | 'staging' | 'production';
  NEXT_PUBLIC_API_BASE_URL?: string;
  NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING?: string;
  NEXT_PUBLIC_ENABLE_DEBUG_MODE?: string;
  NEXT_PUBLIC_TEST_MODE?: string;
  NEXT_PUBLIC_SECURITY_MODE?: string;
}

// Global module declarations for all possible import paths
declare module '*/env.mjs' {
  export const env: EnvVariables;
  export default env;
}


