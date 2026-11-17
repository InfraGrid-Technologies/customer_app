import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../core/theme';
import { useConsentAudit } from '../hooks/useConsentAudit';

const { colors, typography } = theme;

/**
 * Consent Audit & Revocation Screen
 *
 * ROLE:
 * Presentation screen for reviewing immutable DPDP Act 2023 consent artifacts and executing consent revocations.
 * Powered by the headless `useConsentAudit()` hook.
 */
export function ConsentAuditScreen() {
  const {
    consentId,
    setConsentId,
    historyType,
    setHistoryType,
    idNumber,
    setIdNumber,
    loading,
    consentResult,
    historyResult,
    lookupConsent: handleLookupConsent,
    lookupHistory: handleLookupHistory,
  } = useConsentAudit();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Display H1 - Type Scale Lock: text-4xl font-semibold tracking-tight */}
      <Text style={styles.displayH1}>Consent Audit</Text>
      <Text style={styles.displaySub}>DPDP Act 2023 Section 6(4) Compliance Logs</Text>

      {/* Hero Banner */}
      <View style={styles.heroBanner}>
        <View style={styles.heroIconBox}>
          <Ionicons name="shield" size={22} color={colors.violet600} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroTitle}>Immutable Digital Trail</Text>
          <Text style={styles.heroSubtitle}>
            Internal database queries • Costs ₹0.00 • Cryptographic audit proof
          </Text>
        </View>
      </View>

      {/* 1. Consent ID Lookup Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="finger-print" size={16} color={colors.violet600} />
          <Text style={styles.cardTitle}>1. Lookup Consent Artifact by ID</Text>
        </View>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={consentId}
            onChangeText={setConsentId}
            placeholder="Paste Consent ID (UUID)"
            placeholderTextColor={colors.slate400}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={handleLookupConsent}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <>
              <Ionicons name="document-text" size={16} color={colors.white} />
              <Text style={styles.btnText}>Fetch Immutable Consent Record</Text>
            </>
          )}
        </TouchableOpacity>

        {consentResult && (
          <View style={styles.resultBox}>
            <View style={styles.resultHeader}>
              <Ionicons name="shield-checkmark" size={15} color={colors.emerald600} />
              <Text style={styles.resultTitle}>Consent Artifact Found:</Text>
            </View>
            <Text style={styles.resultRow}><Text style={styles.bold}>Status:</Text> {consentResult.status}</Text>
            <Text style={styles.resultRow}><Text style={styles.bold}>Type:</Text> {consentResult.consent_type}</Text>
            <Text style={styles.resultRow}><Text style={styles.bold}>Purpose:</Text> {consentResult.purpose}</Text>
            <Text style={styles.resultRow}><Text style={styles.bold}>Notice Ver:</Text> {consentResult.notice_version}</Text>
            <Text style={styles.resultRow}><Text style={styles.bold}>Client IP:</Text> {consentResult.ip_address}</Text>
            <Text style={styles.resultRow}><Text style={styles.bold}>Granted At:</Text> {new Date(consentResult.granted_at).toLocaleString()}</Text>
            {consentResult.revoked_at && (
              <Text style={[styles.resultRow, { color: colors.red600 }]}>
                <Text style={styles.bold}>Revoked At:</Text> {new Date(consentResult.revoked_at).toLocaleString()}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* 2. Verification History Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="time" size={16} color={colors.blue600} />
          <Text style={styles.cardTitle}>2. Lookup Verification Audit History</Text>
        </View>

        <View style={styles.typeSelectorRow}>
          {[
            { id: 'driving-license', label: 'License' },
            { id: 'rc', label: 'Vehicle' },
            { id: 'bank-account', label: 'Bank' },
            { id: 'challan', label: 'Challan' },
            { id: 'aadhaar', label: 'Aadhaar' },
          ].map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.typePill, historyType === t.id && styles.typePillActive]}
              onPress={() => setHistoryType(t.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.typePillText, historyType === t.id && styles.typePillTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={idNumber}
            onChangeText={setIdNumber}
            placeholder="Document / Vehicle / Account / Session ID"
            placeholderTextColor={colors.slate400}
            autoCapitalize="characters"
          />
        </View>

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={handleLookupHistory}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <>
              <Ionicons name="search" size={16} color={colors.white} />
              <Text style={styles.btnText}>Query Verification History (₹0)</Text>
            </>
          )}
        </TouchableOpacity>

        {historyResult && (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>
              Found {historyResult.length} Historical Records:
            </Text>
            {historyResult.length === 0 ? (
              <Text style={styles.emptyText}>No prior verifications recorded for this ID.</Text>
            ) : (
              historyResult.map((item, idx) => (
                <View key={item.id || idx} style={styles.historyCard}>
                  <View style={styles.historyTopRow}>
                    <Text style={styles.historyType}>
                      {(item.verification_type || '').toUpperCase()}
                    </Text>
                    <View style={[styles.historyBadge, item.status === 'verified' ? styles.badgeGreen : styles.badgeRed]}>
                      <Text style={[styles.historyBadgeText, item.status === 'verified' ? styles.textGreen : styles.textRed]}>
                        {item.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.historyDate}>
                    {new Date(item.created_at).toLocaleString()}
                  </Text>
                  <Text style={styles.historyProvider}>
                    Provider: {item.provider} • ID: {item.id_number}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}
      </View>
    </ScrollView>
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
    backgroundColor: colors.violet50,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.violet200,
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
    borderColor: colors.violet200,
  },
  heroTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.violet700,
  },
  heroSubtitle: {
    fontSize: 11,
    color: colors.violet600,
    marginTop: 1,
    lineHeight: 15,
  },
  card: {
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.slate200,
    marginBottom: 10,
    shadowColor: colors.slate900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.slate900,
  },
  inputWrapper: {
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: colors.slate300,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  input: {
    paddingVertical: 9,
    fontSize: 13,
    color: colors.slate900,
    fontWeight: '600',
  },
  btnPrimary: {
    backgroundColor: colors.blue600,
    paddingVertical: 11,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: colors.blue600,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  btnText: {
    color: colors.white,
    fontSize: 12.5,
    fontWeight: '700',
  },
  resultBox: {
    backgroundColor: colors.slate50,
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  resultTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.slate800,
  },
  resultRow: {
    fontSize: 11,
    color: colors.slate600,
    marginVertical: 1.5,
    fontFamily: 'monospace',
  },
  bold: {
    fontWeight: '700',
    color: colors.slate900,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 8,
  },
  typePill: {
    flex: 1,
    backgroundColor: colors.slate100,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  typePillActive: {
    backgroundColor: colors.blue50,
    borderColor: colors.blue200,
  },
  typePillText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.slate600,
  },
  typePillTextActive: {
    color: colors.blue700,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 11,
    color: colors.slate400,
    fontStyle: 'italic',
    marginTop: 4,
  },
  historyCard: {
    backgroundColor: colors.white,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.slate200,
    marginTop: 5,
  },
  historyTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyType: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.slate900,
  },
  historyBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  badgeGreen: {
    backgroundColor: colors.emerald100,
  },
  badgeRed: {
    backgroundColor: colors.red100,
  },
  historyBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  textGreen: {
    color: colors.emerald700,
  },
  textRed: {
    color: colors.red700,
  },
  historyDate: {
    fontSize: 10,
    color: colors.slate500,
    marginTop: 1,
  },
  historyProvider: {
    fontSize: 10,
    color: colors.slate600,
    fontFamily: 'monospace',
    marginTop: 1,
  },
});
