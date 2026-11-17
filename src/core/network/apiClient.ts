/**
 * Universal Resilient HTTP Client
 *
 * ROLE:
 * Provides a secure, timeout-guarded, and standardized fetch wrapper for all API calls.
 *
 * KEY FEATURES:
 * 1. Dynamic Base URL switching at runtime (via setApiBaseUrl) for switching between Wi-Fi and emulator.
 * 2. Automatic AbortController timeout (20s) preventing indefinite hangs on slow government gateways.
 * 3. Consistent enterprise headers (`x-actor-id`, `Content-Type`, `Accept`).
 * 4. User-friendly error normalization (translates cryptic fetch network errors to clear troubleshooting messages).
 */

import { DEFAULT_BASE_URL } from './endpoints';
import { config } from '../config/env';

let customBaseUrl: string = DEFAULT_BASE_URL;

/**
 * Dynamically reconfigures the base URL at runtime.
 * Useful for mobile debugging when switching between Wi-Fi and emulator IPs.
 */
export function setApiBaseUrl(url: string): void {
  if (!url) return;
  customBaseUrl = url.trim().replace(/\/+$/, '');
}

/**
 * Returns the currently active base API URL.
 */
export function getApiBaseUrl(): string {
  return customBaseUrl;
}

export interface ApiClientOptions extends RequestInit {
  headers?: Record<string, string>;
}

export interface ApiError extends Error {
  status?: number;
  details?: unknown;
}

/**
 * Primary HTTP Request Function
 *
 * @template T - Expected JSON response shape
 * @param path - Endpoint URI path (e.g. '/v1/kyc/driving-license')
 * @param options - Fetch request options (method, body, custom headers)
 * @returns Promise resolving to type T
 */
export async function apiClient<T = unknown>(path: string, options: ApiClientOptions = {}): Promise<T> {
  const url = `${customBaseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'x-actor-id': '10000000-0000-4000-8000-000000000001',
    ...(options.headers || {}),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.networkTimeoutMs);

  try {
    const response = await fetch(url, { ...options, headers, signal: controller.signal });
    clearTimeout(timeoutId);
    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = json.message || `Request failed with status ${response.status}`;
      const err: ApiError = new Error(errorMsg);
      err.status = response.status;
      err.details = json;
      throw err;
    }

    return json as T;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after ${config.networkTimeoutMs / 1000}s. Server at ${customBaseUrl} took too long to respond.`);
    }
    if (err.message?.includes('Network request failed') || err.name === 'TypeError') {
      throw new Error(`Cannot reach backend at ${customBaseUrl}. Please ensure your phone/emulator and PC are on the same Wi-Fi network!`);
    }
    throw err;
  }
}
