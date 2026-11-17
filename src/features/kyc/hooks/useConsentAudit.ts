/**
 * KYC Feature Slice Hook: useConsentAudit
 *
 * ROLE:
 * Headless business logic for Digital Personal Data Protection (DPDP) Act 2023 Consent Audit.
 * Manages consent artifact lookup, audit history queries, and consent revocation.
 */

import { useState } from 'react';
import { Alert } from 'react-native';
import { kycApi } from '../services/kycApi';

export function useConsentAudit() {
  const [consentId, setConsentId] = useState('');
  const [historyType, setHistoryType] = useState('driving-license');
  const [idNumber, setIdNumber] = useState('TS01620240001534');

  const [loading, setLoading] = useState(false);
  const [consentResult, setConsentResult] = useState<any>(null);
  const [historyResult, setHistoryResult] = useState<any>(null);

  const lookupConsent = async () => {
    if (!consentId.trim()) {
      Alert.alert('Required', 'Please enter a Consent ID.');
      return;
    }
    setLoading(true);
    setConsentResult(null);
    try {
      const res = await kycApi.getConsent(consentId.trim());
      setConsentResult(res.data);
    } catch (err: any) {
      Alert.alert('Consent Not Found', err.message || 'Could not find consent artifact.');
    } finally {
      setLoading(false);
    }
  };

  const lookupHistory = async () => {
    if (!idNumber.trim()) {
      Alert.alert('Required', 'Please enter an ID or document number.');
      return;
    }
    setLoading(true);
    setHistoryResult(null);
    try {
      const res = await kycApi.getHistory(historyType, idNumber.trim());
      setHistoryResult(res.data);
    } catch (err: any) {
      Alert.alert('History Error', err.message || 'Could not fetch history.');
    } finally {
      setLoading(false);
    }
  };

  const revokeConsent = async (targetConsentId: string) => {
    if (!targetConsentId) return;
    setLoading(true);
    try {
      await kycApi.revokeConsent(targetConsentId);
      Alert.alert('Consent Revoked', 'Consent artifact has been marked as REVOKED under DPDP Act Sec 6(4).');
      // Refresh current view if looking at this consent
      if (consentResult?.consent_id === targetConsentId) {
        setConsentResult((prev: any) => ({ ...prev, status: 'REVOKED' }));
      }
    } catch (err: any) {
      Alert.alert('Revocation Error', err.message || 'Failed to revoke consent.');
    } finally {
      setLoading(false);
    }
  };

  return {
    consentId,
    setConsentId,
    historyType,
    setHistoryType,
    idNumber,
    setIdNumber,
    loading,
    consentResult,
    historyResult,
    lookupConsent,
    lookupHistory,
    revokeConsent,
  };
}

export default useConsentAudit;

