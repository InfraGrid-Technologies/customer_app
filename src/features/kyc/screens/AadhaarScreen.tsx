import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VerifiedBadgeCard } from '../components/VerifiedBadgeCard';
import { theme } from '../../../core/theme';
import { useAadhaar } from '../hooks/useAadhaar';

const { colors } = theme;

/**
 * Aadhaar DigiLocker e-KYC Verification Screen
 *
 * Production Flow:
 * 1. Explains the official UIDAI DigiLocker direct authentication process clearly.
 * 2. User authorizes DPDP consent and connects to the official DigiLocker Gateway.
 * 3. User enters their 12-digit Aadhaar & OTP on the official government portal.
 * 4. User is redirected back to this screen via deep link (`equiprent://aadhaar`),
 *    and verified electronic Aadhaar credentials are retrieved and displayed.
 */
export function AadhaarScreen() {
  const {
    agreed,
    setAgreed,
    loading,
    session,
    result,
    initiateSession: handleInitiate,
    openDigilockerGateway: handleOpenDigilockerGateway,
    fetchAadhaarDetails: handleFetchAadhaar,
    reset: handleReset,
  } = useAadhaar();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
      showsVerticalScrollIndicator={false}
    >
      {/* Process Explanation Card */}
      <View style={styles.gatewayBox}>
        <View style={styles.iconBadge}>
          <Ionicons name="finger-print-outline" size={28} color="#EA580C" />
        </View>
        <Text style={styles.gatewayTitle}>Direct Authentication on DigiLocker</Text>
        <Text style={styles.gatewaySubtitle}>
          Under UIDAI & MeitY regulations, you do not upload or type your Aadhaar inside this app.
          You authenticate directly on the official DigiLocker portal using an OTP sent to your Aadhaar-registered mobile number.
        </Text>

        {/* 4-Step Process Breakdown */}
        <View style={styles.stepsContainer}>
          {/* Step 1 */}
          <View style={styles.stepItem}>
            <View style={styles.stepNumberBadge}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepHeading}>Initiate Secure Session</Text>
              <Text style={styles.stepDesc}>
                Generates a 256-bit encrypted session with the National Data Gateway and links EquipRent brand credentials.
              </Text>
            </View>
          </View>

          {/* Step 2 */}
          <View style={styles.stepItem}>
            <View style={styles.stepNumberBadge}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepHeading}>Enter Aadhaar & OTP on Government Portal</Text>
              <Text style={styles.stepDesc}>
                You are securely redirected to the official DigiLocker gateway. Enter your 12-digit Aadhaar number and mobile OTP.
              </Text>
            </View>
          </View>

          {/* Step 3 */}
          <View style={styles.stepItem}>
            <View style={styles.stepNumberBadge}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepHeading}>Authorize Paperless XML Sharing</Text>
              <Text style={styles.stepDesc}>
                Confirm one-time consent to share verified demographic data (Name, Date of Birth, Gender, and Address).
              </Text>
            </View>
          </View>

          {/* Step 4 */}
          <View style={styles.stepItem}>
            <View style={styles.stepNumberBadge}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepHeading}>Automatic Return & Instant Verification</Text>
              <Text style={styles.stepDesc}>
                DigiLocker automatically redirects back to this Aadhaar screen. Verified credentials are saved to your profile.
              </Text>
            </View>
          </View>
        </View>

        {/* Active Session Card */}
        {session && (
          <View style={styles.sessionStatusContainer}>
            <View style={styles.sessionActiveRow}>
              <View style={styles.dotGreen} />
              <Text style={styles.sessionActiveTitle}>Session Active: {session.clientId}</Text>
            </View>
            <Text style={styles.sessionExpiryText}>Valid for {session.validityMinutes || 15} minutes</Text>

            {session.url && (
              <TouchableOpacity
                style={styles.gatewayExternalBtn}
                onPress={handleOpenDigilockerGateway}
                activeOpacity={0.85}
              >
                <Ionicons name="open-outline" size={16} color="#FFFFFF" />
                <Text style={styles.gatewayExternalText}>Open Official DigiLocker Portal</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.sessionNote}>
              After completing OTP verification on the government portal, this screen will automatically refresh with your verified credentials. Or tap the button below to check status.
            </Text>
          </View>
        )}
      </View>

      {/* 3. DPDP Consent Authorization Card */}
      <View style={styles.consentCard}>
        <TouchableOpacity
          style={styles.consentRow}
          onPress={() => setAgreed(!agreed)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, agreed ? styles.checkboxChecked : null]}>
            {agreed && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
          </View>
          <Text style={styles.consentText}>
            I authorize EquipRent to initiate a DigiLocker session to verify my Aadhaar credentials under DPDP Act 2023.{' '}
            <Text
              style={styles.readMoreLink}
              onPress={() =>
                Alert.alert(
                  'Aadhaar e-KYC Policy',
                  'Aadhaar identity is verified through UIDAI DigiLocker Paperless e-KYC in full compliance with the Digital Personal Data Protection Act 2023 and MeitY regulations.'
                )
              }
            >
              Read More
            </Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* 4. Primary Action Button */}
      <TouchableOpacity
        style={[styles.submitButton, (!agreed || loading) ? styles.submitButtonDisabled : null]}
        onPress={session ? handleFetchAadhaar : handleInitiate}
        disabled={loading}
        activeOpacity={0.88}
      >
        <Ionicons name={session ? 'refresh-circle' : 'shield-checkmark'} size={18} color="#FFFFFF" />
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.submitButtonText}>
            {session ? 'Check Verification Status' : 'Connect to DigiLocker'}
          </Text>
        )}
      </TouchableOpacity>

      {/* 5. Verification Result Card */}
      {result && <VerifiedBadgeCard result={result} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  closeBtn: {
    padding: 4,
  },

  // Section Header
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  uidaiBadge: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  uidaiBadgeText: {
    color: '#4338CA',
    fontSize: 11,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 3,
    marginBottom: 14,
    lineHeight: 18,
  },

  // Gateway Flow Box
  gatewayBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  gatewayTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  gatewaySubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 5,
    marginBottom: 16,
    paddingHorizontal: 4,
  },

  // Steps
  stepsContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  stepNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumberText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
  },
  stepHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  stepDesc: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16.5,
  },

  // Active Session Status
  sessionStatusContainer: {
    width: '100%',
    marginTop: 14,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 12,
  },
  sessionActiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dotGreen: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  sessionActiveTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
  },
  sessionExpiryText: {
    fontSize: 11,
    color: '#15803D',
    marginTop: 2,
    marginBottom: 8,
  },
  gatewayExternalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginVertical: 4,
  },
  gatewayExternalText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sessionNote: {
    fontSize: 11,
    color: '#166534',
    marginTop: 6,
    lineHeight: 15,
  },

  // Consent Card
  consentCard: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#C2410C',
    borderColor: '#C2410C',
  },
  consentText: {
    flex: 1,
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18,
    fontWeight: '500',
  },
  readMoreLink: {
    color: '#EA580C',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  // Submit Button
  submitButton: {
    backgroundColor: '#C2410C',
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    shadowColor: '#C2410C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
