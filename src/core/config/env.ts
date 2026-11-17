/**
 * Application Configuration & Environment Variables
 * 
 * ROLE:
 * Centralizes all runtime environment variables with strict TypeScript safety.
 * Instead of reading `process.env.EXPO_PUBLIC_*` directly across screens and components,
 * every part of the app imports typed configuration values from here.
 *
 * HOW IT WORKS IN EXPO:
 * Variables prefixed with `EXPO_PUBLIC_` are statically embedded by Metro bundler at build time.
 * To change values locally, copy `.env.example` to `.env` or `.env.local`.
 */

export const config = {
  /**
   * Fastify Backend API Base URL
   * Priority: .env file -> Fallback to Local PC Wi-Fi
   */
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.31.109:3100',

  /**
   * Application Metadata
   */
  appName: 'EquipRent Enterprise Mobile',
  appVersion: '1.0.0',
  environment: process.env.NODE_ENV || 'development',

  /**
   * Network Timeouts (in milliseconds)
   */
  networkTimeoutMs: 20000, // 20 seconds timeout for government Parivahan/DigiLocker queries
} as const;

export type AppConfig = typeof config;
export default config;

