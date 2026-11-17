import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../core/theme';

const { colors } = theme;

export interface DPDPConsentCardProps {
  agreed: boolean;
  onToggle: (agreed: boolean) => void;
  purpose?: string;
  noticeVersion?: string;
  noticeText?: string;
}

export function DPDPConsentCard({
  agreed,
  onToggle,
  purpose = 'OPERATOR_EQUIPMENT_ELIGIBILITY',
  noticeVersion = 'DL_NOTICE_V1.0',
  noticeText = 'I authorize EquipRent to verify my credentials with government registries solely for qualification and compliance.',
}: DPDPConsentCardProps) {
  return (
    <View style={[styles.card, agreed ? styles.cardAgreed : styles.cardPending]}>
      {/* Header Row: Title */}
      <View style={styles.topRow}>
        <View style={styles.titleGroup}>
          <Ionicons
            name={agreed ? 'shield-checkmark' : 'shield-outline'}
            size={16}
            color={agreed ? colors.emerald600 : colors.slate500}
          />
          <Text style={styles.cardTitle}>Digital Consent Authorization</Text>
        </View>
      </View>

      {/* Meta Badges (Notice Version & Purpose) */}
      <View style={styles.metaWrap}>
        <View style={styles.pillBadge}>
          <Text style={styles.pillLabel}>NOTICE:</Text>
          <Text style={styles.pillValue} numberOfLines={1} ellipsizeMode="tail">
            {noticeVersion}
          </Text>
        </View>

        <View style={styles.pillBadge}>
          <Text style={styles.pillLabel}>PURPOSE:</Text>
          <Text style={styles.pillValue} numberOfLines={1} ellipsizeMode="tail">
            {purpose}
          </Text>
        </View>
      </View>

      {/* Notice Legal Text Box */}
      <View style={styles.noticeBox}>
        <Text style={styles.noticeText}>{noticeText}</Text>
      </View>

      {/* Interactive Switch Row */}
      <TouchableOpacity
        style={[styles.switchRow, agreed ? styles.switchRowAgreed : styles.switchRowPending]}
        activeOpacity={0.8}
        onPress={() => onToggle(!agreed)}
      >
        <View style={styles.switchTextGroup}>
          <Text style={[styles.switchStatusText, agreed ? styles.textAgreed : styles.textPending]}>
            {agreed ? 'Consent Explicitly Granted' : 'Grant Mandatory Authorization'}
          </Text>
          <Text style={styles.switchSubText}>
            {agreed ? 'Cryptographic timestamp & IP logged under Sec 6(1)' : 'Toggle switch to permit government registry query'}
          </Text>
        </View>

        <Switch
          value={agreed}
          onValueChange={onToggle}
          trackColor={{ false: colors.slate300, true: colors.emerald200 }}
          thumbColor={agreed ? colors.emerald600 : colors.slate100}
          style={styles.switch}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
    borderWidth: 1,
    backgroundColor: colors.white,
    shadowColor: colors.slate900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardPending: {
    borderColor: colors.slate200,
    backgroundColor: colors.slate50,
  },
  cardAgreed: {
    borderColor: colors.emerald200,
    backgroundColor: colors.emerald50,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.slate900,
    letterSpacing: -0.2,
  },
  lawTag: {
    backgroundColor: colors.emerald100,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.emerald200,
  },
  lawTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.emerald700,
    letterSpacing: 0.3,
  },
  metaWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.white,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.slate200,
    maxWidth: '100%',
  },
  pillLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.slate500,
    letterSpacing: 0.3,
  },
  pillValue: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.slate800,
    fontFamily: 'monospace',
    flexShrink: 1,
  },
  noticeBox: {
    backgroundColor: colors.white,
    padding: 8,
    borderRadius: 6,
    borderLeftWidth: 2.5,
    borderLeftColor: colors.blue600,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  noticeText: {
    fontSize: 11.5,
    lineHeight: 16,
    color: colors.slate700,
    fontWeight: '400',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  switchRowPending: {
    backgroundColor: colors.white,
    borderColor: colors.slate200,
  },
  switchRowAgreed: {
    backgroundColor: colors.white,
    borderColor: colors.emerald200,
  },
  switchTextGroup: {
    flex: 1,
  },
  switchStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  textPending: {
    color: colors.slate700,
  },
  textAgreed: {
    color: colors.emerald700,
  },
  switchSubText: {
    fontSize: 10,
    color: colors.slate500,
    marginTop: 1,
  },
  switch: {
    transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }],
  },
});
