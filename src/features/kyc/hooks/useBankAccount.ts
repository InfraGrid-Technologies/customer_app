/**
 * KYC Feature Slice Hook: useBankAccount
 *
 * ROLE:
 * Headless business logic for IMPS / NPCI Penny-Drop Bank Account & IFSC verification.
 * Manages bank account numbers, IFSC codes, beneficiary name matching, and test presets.
 */

import { useState } from 'react';
import { Alert } from 'react-native';
import { kycApi } from '../services/kycApi';
import { validators } from '../../../utils/validators';

export function useBankAccount() {
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [nameToMatch, setNameToMatch] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const verify = async (forceRefresh = false) => {
    if (!validators.isValidAccountNumber(accountNumber)) {
      Alert.alert('Required', 'Please enter a valid Bank Account Number (9-18 digits).');
      return;
    }
    if (!validators.isValidIfsc(ifsc)) {
      Alert.alert('Required', 'Please enter a valid 11-character IFSC code (e.g. UTIB0000001).');
      return;
    }
    if (!agreed) {
      Alert.alert(
        'DPDP Consent Required',
        'Under RBI & DPDP guidelines, depositing a ₹1 test credit (penny drop) to verify bank ownership requires explicit account holder consent.'
      );
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await kycApi.verifyBankAccount({
        accountNumber: accountNumber.trim(),
        ifsc: ifsc.trim().toUpperCase(),
        nameToMatch: nameToMatch.trim() || undefined,
        consent: {
          agreed: true,
          noticeVersion: 'BANK_NOTICE_V1.0',
          noticeText: 'I authorize EquipRent to verify my bank account via penny drop verification for automated rental payouts.',
        },
        forceRefresh,
      });

      setResult(response);
    } catch (err: any) {
      Alert.alert('Bank Verification Failed', err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (acc: string, code: string, name: string) => {
    setAccountNumber(acc);
    setIfsc(code);
    setNameToMatch(name);
    setResult(null);
  };

  const reset = () => {
    setResult(null);
  };

  return {
    accountNumber,
    setAccountNumber,
    ifsc,
    setIfsc,
    nameToMatch,
    setNameToMatch,
    agreed,
    setAgreed,
    loading,
    result,
    verify,
    loadPreset,
    reset,
  };
}

export default useBankAccount;

