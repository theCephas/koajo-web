/**
 * Environment Configuration
 * Add this to your .env.local file
 */

// Example .env.local content:
/*
NEXT_PUBLIC_API_URL=https://api.koajo.com
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
*/

export const ENV_CONFIG = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.koajo.com',
  APP_ENV: process.env.NEXT_PUBLIC_APP_ENV || 'development',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
} as const;
