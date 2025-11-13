// This file configures the initialization of Sentry on the browser/client side
// This is the new recommended way for Turbopack compatibility
// Replaces sentry.client.config.ts for better Turbopack support
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

// P1 Optimization: Lazy initialization with dynamic import to avoid bundling Sentry in vendors chunk
// This reduces the initial bundle size by ~10-15 kB (Brotli)

// Environment variables with fallbacks
const SENTRY_DSN = process.env['SENTRY_DSN'] || '';
const NODE_ENV = process.env['NODE_ENV'] || 'development';
const VERCEL_GIT_COMMIT_SHA =
  process.env['VERCEL_GIT_COMMIT_SHA'] || 'development';

// Track initialization state
let sentryInitialized = false;

// Lazy initialization function with dynamic import
function initializeSentry() {
  if (sentryInitialized || NODE_ENV !== 'production' || !SENTRY_DSN) {
    return;
  }

  sentryInitialized = true;

  // Dynamic import to avoid bundling Sentry in the initial vendors chunk
  // 通过变量名规避静态分析在测试构建期解析依赖
  const mod = '@sentry/nextjs' as const;
  import(mod)
    .then((Sentry) => {
      Sentry.init({
        dsn: SENTRY_DSN,

        // Disable tracing to reduce runtime overhead (build also excludes tracing)
        tracesSampleRate: 0,

        // Disable debug in production
        debug: false,

        // Disable Session Replay to significantly reduce bundle size
        // Session Replay adds ~2MB to the bundle and is not critical for basic error tracking
        replaysOnErrorSampleRate: 0,
        replaysSessionSampleRate: 0,

        // Task B: Filter out heavy integrations to minimize bundle size
        // Removes: Metrics (~5-8 kB), Feedback (~32 kB), Replay (~5 kB)
        // Total reduction: ~40-45 kB (Brotli)
        defaultIntegrations: (integrations) =>
          integrations.filter(
            (integration) =>
              !['Metrics', 'Feedback', 'Replay', 'ReplayCanvas'].includes(
                integration.name,
              ),
          ),

        // Set user context
        initialScope: {
          tags: {
            component: 'client',
            turbopack: 'enabled', // 标记使用 Turbopack
          },
        },

        // Environment configuration
        environment: NODE_ENV,

        // Release tracking
        release: VERCEL_GIT_COMMIT_SHA,

        // Optimized error filtering for production
        beforeSend(event) {
          // Filter out non-critical errors to reduce noise
          if (event.exception) {
            const error = event.exception.values?.[0];
            // Skip common non-critical errors
            if (
              error?.type === 'ChunkLoadError' ||
              error?.value?.includes('Loading chunk') ||
              error?.value?.includes('Loading CSS chunk')
            ) {
              return null;
            }
          }
          return event;
        },

        // Minimal transaction tracking
        beforeSendTransaction(event) {
          // Add minimal tags for production
          event.tags = {
            ...event.tags,
            section: 'client',
          };
          return event;
        },
      });
    })
    .catch(() => {
      // Silently fail if Sentry fails to load
    });
}

// Initialize Sentry after the page is idle to avoid blocking the main thread
if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => initializeSentry(), { timeout: 2000 });
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    setTimeout(() => initializeSentry(), 1000);
  }
}

// Development mode: Sentry disabled for bundle size optimization

// Conditional export for router monitoring (only in production)
// Note: This will be a no-op until Sentry is initialized
export const onRouterTransitionStart = function noOpRouterTransition() {
  // No-op function - router monitoring is not critical for error tracking
  // If needed, can be enabled after Sentry initialization
};
