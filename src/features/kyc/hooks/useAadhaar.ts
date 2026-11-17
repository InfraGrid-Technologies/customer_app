/**
 * KYC Feature Slice Hook: useAadhaar
 *
 * Headless business logic for UIDAI DigiLocker Aadhaar e-KYC.
 * Manages:
 * 1. DPDP 2023 compliant session initiation with custom logo & redirect URL
 * 2. In-app government gateway presentation via expo-web-browser (openAuthSessionAsync)
 * 3. Deep link return interception (equiprent://aadhaar) to prevent 404 pages
 * 4. Automatic detail fetching upon user return from DigiLocker
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { kycApi } from '../services/kycApi';
import { getApiBaseUrl } from '../../../core/network/apiClient';

// Production brand logo & mobile deep link redirect URL
const AADHAAR_LOGO_URL = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
const AADHAAR_DEEP_LINK = 'equiprent://aadhaar';

export function useAadhaar() {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [result, setResult] = useState<any>(null);

  // Keep refs to avoid stale closures in deep link & browser session handlers
  const sessionRef = useRef<any>(null);
  sessionRef.current = session;
  const resultRef = useRef<any>(null);
  resultRef.current = result;

  /**
   * Fetches verified Aadhaar XML details after user finishes OTP verification
   */
  const fetchAadhaarDetails = useCallback(
    async (targetClientIdOrEvent?: string | any, options: { silentIfPending?: boolean } = {}) => {
      const activeSession = sessionRef.current;
      const targetClientId =
        typeof targetClientIdOrEvent === 'string'
          ? targetClientIdOrEvent
          : activeSession?.clientId;

      if (!targetClientId) {
        if (!options.silentIfPending) {
          Alert.alert('Required', 'Please initiate a DigiLocker session first.');
        }
        return;
      }

      setLoading(true);
      try {
        const response = await kycApi.getAadhaarDetails(targetClientId);
        if (!response.consentId && activeSession?.consentId) {
          response.consentId = activeSession.consentId;
        }

        // Verify if verification succeeded or is completed
        if (response.isVerified || response.data?.status === 'COMPLETED') {
          setResult(response);
        } else if (!options.silentIfPending) {
          const reason =
            response.rejectionReasons?.[0] ||
            response.data?.message ||
            'Aadhaar OTP verification is pending on DigiLocker. Please complete the OTP step.';
          Alert.alert('Verification Pending', reason);
        }
      } catch (err: any) {
        if (!options.silentIfPending) {
          Alert.alert(
            'Failed to Fetch Aadhaar',
            err.message || 'Verification details could not be retrieved at this time.'
          );
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Deep Link Listener:
   * When user completes OTP on DigiLocker, the gateway / callback redirects to `equiprent://aadhaar`.
   * This listener detects the return, dismisses any active in-app browser sheet,
   * and automatically triggers fetchAadhaarDetails.
   */
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      if (event.url && event.url.includes('aadhaar')) {
        try {
          WebBrowser.dismissAuthSession();
        } catch {
          // Fallback if browser already dismissed
        }

        // Parse clientId if attached to query parameters (e.g. equiprent://aadhaar?client_id=...)
        let extractedClientId: string | undefined;
        try {
          const urlObj = new URL(event.url);
          extractedClientId =
            urlObj.searchParams.get('client_id') ||
            urlObj.searchParams.get('clientId') ||
            undefined;
        } catch {
          const match = event.url.match(/client_id=([^&]+)/i);
          if (match && match[1]) {
            extractedClientId = decodeURIComponent(match[1]);
          }
        }

        const activeId = extractedClientId || sessionRef.current?.clientId;
        if (activeId && !resultRef.current) {
          fetchAadhaarDetails(activeId, { silentIfPending: false });
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url && url.includes('aadhaar')) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [fetchAadhaarDetails]);

  /**
   * Resolves the best HTTPS redirect callback URL:
   * If the API client is configured with an HTTPS URL, use backend's `/v1/kyc/aadhaar/callback`.
   * Otherwise pass deep link scheme or let backend fallback to secure callback.
   */
  const getCallbackUrl = (): string => {
    const baseUrl = getApiBaseUrl();
    if (baseUrl && baseUrl.startsWith('https://')) {
      return `${baseUrl}/v1/kyc/aadhaar/callback`;
    }
    return AADHAAR_DEEP_LINK;
  };

  /**
   * Opens the official DigiLocker portal using an in-app secure browser (WebBrowser.openAuthSessionAsync).
   * This intercepts redirects before 404 pages can render and smoothly brings user back into EquipRent.
   */
  const openDigilockerGateway = async (customSession?: any) => {
    const activeSession = customSession || sessionRef.current;
    if (!activeSession?.url) {
      Alert.alert('No Gateway URL', 'Session does not have an active gateway URL.');
      return;
    }

    // 1. Mock Mode: simulate instant verification without making external browser requests
    if (activeSession.url.includes('mock-digilocker') || activeSession.url.includes('.local')) {
      setLoading(true);
      setTimeout(async () => {
        try {
          await fetchAadhaarDetails(activeSession.clientId, { silentIfPending: false });
        } finally {
          setLoading(false);
        }
      }, 700);
      return;
    }

    // 2. Live DigiLocker Mode (Surepass Gateway)
    try {
      setLoading(true);
      const callbackTarget = getCallbackUrl();

      // Launch in-app Chrome Custom Tab (Android) or ASWebAuthenticationSession (iOS)
      const authResult = await WebBrowser.openAuthSessionAsync(
        activeSession.url,
        callbackTarget.startsWith('https://') ? callbackTarget : undefined,
        {
          toolbarColor: '#0F172A',
          controlsColor: '#FFFFFF',
          showTitle: true,
          enableBarCollapsing: true,
          dismissButtonStyle: 'close',
        }
      );

      // When browser session completes or is closed by the user, automatically check verification status
      if (activeSession.clientId) {
        await fetchAadhaarDetails(activeSession.clientId, {
          silentIfPending: authResult.type === 'cancel' || authResult.type === 'dismiss',
        });
      }
    } catch (e: any) {
      // Graceful fallback to Linking if in-app browser has platform issue
      try {
        await Linking.openURL(activeSession.url);
      } catch {
        Alert.alert('Gateway Error', e.message || 'Could not open verification window.');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initiates DigiLocker consent session and automatically launches the in-app gateway
   */
  const initiateSession = async () => {
    if (!agreed) {
      Alert.alert(
        'DPDP Consent Required',
        'Under UIDAI regulations and India DPDP Act 2023, initiating a DigiLocker session requires explicit authorization.'
      );
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const callbackUrl = getCallbackUrl();
      const response = await kycApi.initiateAadhaar({
        redirectUrl: callbackUrl,
        logoUrl: AADHAAR_LOGO_URL,
        consent: {
          agreed: true,
          noticeVersion: 'AADHAAR_NOTICE_V1.0',
          noticeText:
            'I authorize EquipRent to initiate a DigiLocker session to fetch verified Aadhaar XML credentials for operator KYC under India DPDP Act 2023.',
        },
      });

      const newSession = {
        ...response.data,
        consentId: response.consentId,
        provider: response.provider,
      };

      setSession(newSession);
      sessionRef.current = newSession;

      // Automatically launch the in-app DigiLocker browser
      if (newSession.url) {
        await openDigilockerGateway(newSession);
      }
    } catch (err: any) {
      Alert.alert('Session Initiation Failed', err.message || 'Could not initiate DigiLocker session.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setSession(null);
    sessionRef.current = null;
    resultRef.current = null;
  };

  return {
    agreed,
    setAgreed,
    loading,
    session,
    setSession,
    result,
    setResult,
    initiateSession,
    openDigilockerGateway,
    fetchAadhaarDetails,
    reset,
  };
}

export default useAadhaar;
