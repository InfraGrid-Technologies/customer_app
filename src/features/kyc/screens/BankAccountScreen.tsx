import React, { useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  LayoutChangeEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DPDPConsentCard } from '../components/DPDPConsentCard';
import { VerifiedBadgeCard } from '../components/VerifiedBadgeCard';
import { theme } from '../../../core/theme';
import { useBankAccount } from '../hooks/useBankAccount';
import { useKeyboardOffset } from '../hooks/useKeyboardOffset';

const { colors, typography } = theme;

/**
 * Bank Account & Payout Verification Screen
 *
 * ROLE:
 * Presentation screen for automated penny-drop verification & account holder matching.
 * Powered by the headless `useBankAccount()` hook.
 */
export function BankAccountScreen() {
  const {
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
    verify: handleVerify,
    loadPreset,
  } = useBankAccount();

  const ifscInputRef = useRef<any>(null);
  const nameInputRef = useRef<any>(null);
  const scrollViewRef = useRef<any>(null);
  const fieldOffsets = useRef<{ [key: string]: number }>({});
  const { dynamicPaddingBottom } = useKeyboardOffset(16);

  const handleLayout = (fieldKey: string, event: LayoutChangeEvent) => {
    fieldOffsets.current[fieldKey] = event.nativeEvent.layout.y;
  };

  const scrollToField = (fieldKey: string) => {
    const y = fieldOffsets.current[fieldKey];
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: y !== undefined ? Math.max(0, y - 12) : 180,
        animated: true,
      });
    }, 120);
  };

  const isFormValid = agreed && accountNumber.trim().length >= 9 && ifsc.trim().length === 11 && !loading;

  return (
    <View style={{ flex: 1, backgroundColor: colors.slate50 }}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: dynamicPaddingBottom }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        showsVerticalScrollIndicator={false}
      >
      {/* Display H1 - Type Scale Lock: text-4xl font-semibold tracking-tight */}
      <Text style={styles.displayH1}>Bank Payouts</Text>
      <Text style={styles.displaySub}>NPCI Penny-Drop & Beneficiary Matching</Text>

      {/* Hero Banner */}
      <View style={styles.heroBanner}>
        <View style={styles.heroIconBox}>
          <Ionicons name="business" size={22} color={colors.emerald600} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroTitle}>Automated Settlement Account</Text>
          <Text style={styles.heroSubtitle}>
            Deposits ₹1 test credit to verify account title & matching beneficiary name
          </Text>
        </View>
      </View>

      {/* Quick Test Preset */}
      <View style={styles.presetRow}>
        <Text style={styles.presetLabel}>PRESETS:</Text>
        <TouchableOpacity
          style={styles.presetChip}
          onPress={() => loadPreset('112233445566', 'UTIB0000001', 'Suresh Kumar')}
          activeOpacity={0.7}
        >
          <Ionicons name="wallet-outline" size={12} color={colors.emerald600} />
          <Text style={styles.presetChipText}>Sample Test Account</Text>
        </TouchableOpacity>
      </View>

      {/* Form Card */}
      <View style={styles.formCard}>
        <View
          style={styles.inputGroup}
          onLayout={(e) => handleLayout('accountNumber', e)}
        >
          <Text style={styles.inputLabel}>BANK ACCOUNT NUMBER</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="wallet-outline" size={16} color={colors.slate500} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={accountNumber}
              onChangeText={setAccountNumber}
              onFocus={() => scrollToField('accountNumber')}
              placeholder="e.g. 123456789012"
              placeholderTextColor={colors.slate400}
              keyboardType="numeric"
              returnKeyType="next"
              onSubmitEditing={() => ifscInputRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>
        </View>

        <View
          style={styles.inputGroup}
          onLayout={(e) => handleLayout('ifsc', e)}
        >
          <Text style={styles.inputLabel}>IFSC CODE</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="globe-outline" size={16} color={colors.slate500} style={styles.inputIcon} />
            <TextInput
              ref={ifscInputRef}
              style={styles.input}
              value={ifsc}
              onChangeText={setIfsc}
              onFocus={() => scrollToField('ifsc')}
              placeholder="e.g. ABCD0123456"
              placeholderTextColor={colors.slate400}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => nameInputRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>
        </View>

        <View
          style={styles.inputGroup}
          onLayout={(e) => handleLayout('name', e)}
        >
          <Text style={styles.inputLabel}>EXPECTED BENEFICIARY NAME (OPTIONAL MATCH)</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={16} color={colors.slate500} style={styles.inputIcon} />
            <TextInput
              ref={nameInputRef}
              style={styles.input}
              value={nameToMatch}
              onChangeText={setNameToMatch}
              onFocus={() => scrollToField('name')}
              placeholder="e.g. Suresh Kumar"
              placeholderTextColor={colors.slate400}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
          </View>
        </View>

        {/* DPDP Consent */}
        <DPDPConsentCard
          agreed={agreed}
          onToggle={setAgreed}
          purpose="OPERATOR_PAYOUT_SETTLEMENT"
          noticeVersion="BANK_NOTICE_V1.0"
          noticeText="I consent to a micro-deposit (penny drop) to verify my account title with NPCI/Bank for equipment rental settlements."
        />

        <TouchableOpacity
          style={[styles.verifyButton, !isFormValid && styles.verifyButtonDisabled]}
          onPress={() => handleVerify(false)}
          disabled={!isFormValid}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <>
              <Ionicons name="cash" size={17} color={colors.white} />
              <Text style={styles.verifyButtonText}>
                {agreed ? 'Execute Penny Drop Check' : 'Fill All Details & Grant Consent'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {result && <VerifiedBadgeCard result={result} />}
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.slate50,
  },
  content: {
    padding: 14,
    paddingBottom: 16,
  },
  displayH1: {
    ...typography.displayH1,
    color: colors.slate950,
    marginTop: 4,
    marginBottom: 2,
  },
  displaySub: {
    fontSize: 13,
    color: colors.slate500,
    fontWeight: '500',
    marginBottom: 12,
  },
  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.emerald50,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.emerald200,
    marginBottom: 10,
  },
  heroIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.emerald200,
  },
  heroTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.emerald700,
  },
  heroSubtitle: {
    fontSize: 11,
    color: colors.emerald600,
    marginTop: 1,
    lineHeight: 15,
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  presetLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.slate500,
    letterSpacing: 0.3,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  presetChipText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: colors.emerald700,
  },
  formCard: {
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.slate200,
    shadowColor: colors.slate900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  inputGroup: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.slate600,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: colors.slate300,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    paddingVertical: 9,
    fontSize: 13.5,
    fontWeight: '600',
    color: colors.slate900,
  },
  verifyButton: {
    backgroundColor: colors.blue600,
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
    shadowColor: colors.blue600,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  verifyButtonDisabled: {
    backgroundColor: colors.slate400,
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyButtonText: {
    color: colors.white,
    fontSize: 13.5,
    fontWeight: '700',
  },
});
