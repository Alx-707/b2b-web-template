import { env } from '../../env.mjs';

/**
 * Security constants to avoid magic numbers
 */
const SECURITY_CONSTANTS = {
  // Email validation
  MAX_EMAIL_LENGTH: 254,

  // Token generation
  DEFAULT_TOKEN_LENGTH: 32,
  HEX_RADIX: 2,
  HEX_PAD_LENGTH: 2,
  HEX_BASE: 16,

  // Rate limiting
  DEFAULT_MAX_REQUESTS: 10,
  DEFAULT_WINDOW_MS: 60000, // 1 minute

  // File upload
  MAX_FILE_SIZE_MB: 10,
  BYTES_PER_MB: 1024,
  KB_TO_BYTES: 1024,

  // Crypto
  SALT_BYTE_LENGTH: 16,
  HEX_CHARS_PER_BYTE: 2,

  // Cleanup interval
  CLEANUP_INTERVAL_MINUTES: 5,
  MINUTES_TO_MS: 60,
  SECONDS_TO_MS: 1000,
} as const;

/**
 * Security utilities and helpers
 */

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data: protocol
    .trim();
}

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return (
    emailRegex.test(email) &&
    email.length <= SECURITY_CONSTANTS.MAX_EMAIL_LENGTH
  );
}

/**
 * Validate URL format and protocol
 */
export function isValidUrl(
  url: string,
  allowedProtocols: string[] = ['http:', 'https:'],
): boolean {
  try {
    const urlObj = new URL(url);
    return allowedProtocols.includes(urlObj.protocol);
  } catch {
    return false;
  }
}

/**
 * Generate a secure random string
 */
export function generateSecureToken(
  length: number = SECURITY_CONSTANTS.DEFAULT_TOKEN_LENGTH,
): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    // Generate half the length in bytes since each byte becomes 2 hex characters
    const byteLength = Math.ceil(length / SECURITY_CONSTANTS.HEX_RADIX);
    const array = new Uint8Array(byteLength);
    crypto.getRandomValues(array);
    const hex = Array.from(array, (byte) =>
      byte
        .toString(SECURITY_CONSTANTS.HEX_BASE)
        .padStart(SECURITY_CONSTANTS.HEX_PAD_LENGTH, '0'),
    ).join('');
    return hex.substring(0, length);
  }

  // Fallback for environments without crypto.getRandomValues
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Rate limiting utility
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export function rateLimit(
  identifier: string,
  maxRequests: number = SECURITY_CONSTANTS.DEFAULT_MAX_REQUESTS,
  windowMs: number = SECURITY_CONSTANTS.DEFAULT_WINDOW_MS, // 1 minute
): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    // First request or window expired
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (entry.count >= maxRequests) {
    // Rate limit exceeded
    return false;
  }

  // Increment count
  entry.count += 1;
  rateLimitStore.set(identifier, entry);
  return true;
}

/**
 * Clean up expired rate limit entries
 */
export function cleanupRateLimit(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Validate file upload security
 */
export function validateFileUpload(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check file size (10MB limit)
  const maxSize =
    SECURITY_CONSTANTS.MAX_FILE_SIZE_MB *
    SECURITY_CONSTANTS.BYTES_PER_MB *
    SECURITY_CONSTANTS.KB_TO_BYTES;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${SECURITY_CONSTANTS.MAX_FILE_SIZE_MB}MB limit`,
    };
  }

  // Check file type
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/csv',
  ];

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' };
  }

  // Check file name
  const dangerousExtensions = [
    '.exe',
    '.bat',
    '.cmd',
    '.scr',
    '.pif',
    '.js',
    '.vbs',
  ];
  const fileName = file.name.toLowerCase();

  for (const ext of dangerousExtensions) {
    if (fileName.endsWith(ext)) {
      return { valid: false, error: 'File extension not allowed' };
    }
  }

  return { valid: true };
}

/**
 * Hash password using Web Crypto API
 */
export async function hashPassword(
  password: string,
  salt?: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const saltBytes = salt
    ? encoder.encode(salt)
    : crypto.getRandomValues(
        new Uint8Array(SECURITY_CONSTANTS.SALT_BYTE_LENGTH),
      );
  const passwordBytes = encoder.encode(password);

  const combined = new Uint8Array(saltBytes.length + passwordBytes.length);
  combined.set(saltBytes);
  combined.set(passwordBytes, saltBytes.length);

  const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) =>
      b
        .toString(SECURITY_CONSTANTS.HEX_BASE)
        .padStart(SECURITY_CONSTANTS.HEX_PAD_LENGTH, '0'),
    )
    .join('');

  const saltHex = Array.from(saltBytes)
    .map((b) =>
      b
        .toString(SECURITY_CONSTANTS.HEX_BASE)
        .padStart(SECURITY_CONSTANTS.HEX_PAD_LENGTH, '0'),
    )
    .join('');

  return `${saltHex}:${hashHex}`;
}

/**
 * Verify password against hash
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  try {
    const [saltHex, expectedHash] = hash.split(':');
    if (!saltHex || !expectedHash) {
      return false;
    }

    const salt = saltHex.match(/.{2}/g)?.map((byte) => parseInt(byte, 16));
    if (!salt) {
      return false;
    }

    const saltBytes = new Uint8Array(salt);
    const actualHash = await hashPassword(
      password,
      new TextDecoder().decode(saltBytes),
    );

    return actualHash === hash;
  } catch {
    return false;
  }
}

/**
 * Security headers for API responses
 */
export function getApiSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };
}

/**
 * Verify Turnstile token
 */
export async function verifyTurnstileToken(
  token: string,
  remoteip?: string,
): Promise<boolean> {
  try {
    const response = await fetch('/api/verify-turnstile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, remoteip }),
    });

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error('Error verifying Turnstile token:', error);
    return false;
  }
}

/**
 * Security configuration check
 */
export function checkSecurityConfig(testMode = false): {
  configured: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Use process.env directly in tests to avoid env validation issues
  const nodeEnv = process.env.NODE_ENV;
  const turnstileKey =
    testMode || process.env.NODE_ENV === 'test'
      ? process.env.TURNSTILE_SECRET_KEY
      : env.TURNSTILE_SECRET_KEY;
  const sentryDsn =
    testMode || process.env.NODE_ENV === 'test'
      ? process.env.SENTRY_DSN
      : env.SENTRY_DSN;
  const securityMode =
    testMode || process.env.NODE_ENV === 'test'
      ? process.env.NEXT_PUBLIC_SECURITY_MODE
      : env.NEXT_PUBLIC_SECURITY_MODE;

  // Check environment variables
  if (!turnstileKey && nodeEnv === 'production') {
    issues.push('Turnstile secret key not configured in production');
  }

  if (!sentryDsn && nodeEnv === 'production') {
    recommendations.push('Consider configuring Sentry for error monitoring');
  }

  if (securityMode === 'relaxed' && nodeEnv === 'production') {
    issues.push('Security mode is set to relaxed in production');
  }

  return {
    configured: issues.length === 0,
    issues,
    recommendations,
  };
}

// Clean up rate limit entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(
    cleanupRateLimit,
    SECURITY_CONSTANTS.CLEANUP_INTERVAL_MINUTES *
      SECURITY_CONSTANTS.MINUTES_TO_MS *
      SECURITY_CONSTANTS.SECONDS_TO_MS,
  );
}
