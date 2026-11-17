/**
 * Network Endpoints & Environment Registry
 *
 * ROLE:
 * Maintains preset host configurations for local development, Android emulator,
 * and production cloud APIs. It also supplies the active default base URL.
 *
 * DEVELOPER USAGE:
 * Import `DEFAULT_BASE_URL` when initializing network clients, or import `ENVIRONMENTS`
 * when displaying environment switches (e.g., in debug/settings modals).
 */

import { config } from '../config/env';

export interface EnvironmentConfig {
  id: string;
  name: string;
  url: string;
}

export const ENVIRONMENTS: Record<string, EnvironmentConfig> = {
  LOCAL_PC: {
    id: 'LOCAL_PC',
    name: 'Local Wi-Fi (PC)',
    url: config.apiUrl,
  },
  ANDROID_EMULATOR: {
    id: 'ANDROID_EMULATOR',
    name: 'Android Emulator (10.0.2.2)',
    url: 'http://10.0.2.2:3100',
  },
  PRODUCTION: {
    id: 'PRODUCTION',
    name: 'Production Cloud API',
    url: 'https://api.equiprent.in',
  },
};

/**
 * Default API host URL: reads from .env via config.apiUrl, defaulting to Local Wi-Fi PC
 */
export const DEFAULT_BASE_URL: string = config.apiUrl;
