import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrivingLicenseScreen } from '../screens/DrivingLicenseScreen';
import { VehicleInspectionScreen } from '../screens/VehicleInspectionScreen';
import { AadhaarScreen } from '../screens/AadhaarScreen';
import { BankAccountScreen } from '../screens/BankAccountScreen';
import { ConsentAuditScreen } from '../screens/ConsentAuditScreen';
import { theme } from '../../../core/theme';

const { colors } = theme;

const TABS = [
  { id: 'dl', label: 'License', icon: 'id-card-outline', activeIcon: 'id-card' },
  { id: 'vehicle', label: 'Vehicle', icon: 'construct-outline', activeIcon: 'construct' },
  { id: 'aadhaar', label: 'Aadhaar', icon: 'finger-print-outline', activeIcon: 'finger-print' },
  { id: 'bank', label: 'Bank', icon: 'wallet-outline', activeIcon: 'wallet' },
  { id: 'audit', label: 'Audit', icon: 'shield-outline', activeIcon: 'shield' },
];

/**
 * Drop-In KYC Feature Navigator
 * Can be mounted directly inside any React Navigation Stack or standalone.
 *
 * Usage:
 * <KycNavigator initialTab="dl" onBack={() => navigation.goBack()} />
 */
export interface KycNavigatorProps {
  initialTab?: 'dl' | 'vehicle' | 'aadhaar' | 'bank' | 'audit' | string;
  onBack?: () => void;
}

export function KycNavigator({ initialTab = 'dl', onBack }: KycNavigatorProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <View style={styles.container}>
      {/* Optional In-Flow Back Header */}
      {onBack && (
        <View style={styles.topNavRow}>
          <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color={colors.slate800} />
            <Text style={styles.backText}>Back to App</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Screen View */}
      <View style={styles.screenContainer}>
        {activeTab === 'dl' && <DrivingLicenseScreen />}
        {activeTab === 'vehicle' && <VehicleInspectionScreen />}
        {activeTab === 'aadhaar' && <AadhaarScreen />}
        {activeTab === 'bank' && <BankAccountScreen />}
        {activeTab === 'audit' && <ConsentAuditScreen />}
      </View>

      {/* 5-Pillar Navigation Bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.tabIconWrap, isActive && styles.tabIconWrapActive]}>
                <Ionicons
                  name={(isActive ? tab.activeIcon : tab.icon) as any}
                  size={19}
                  color={isActive ? colors.blue600 : colors.slate500}
                />
              </View>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.slate50,
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate200,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.slate800,
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.slate200,
    paddingBottom: 4,
    paddingTop: 6,
    shadowColor: colors.slate900,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3,
  },
  tabButtonActive: {},
  tabIconWrap: {
    padding: 2,
    borderRadius: 8,
  },
  tabIconWrapActive: {
    backgroundColor: colors.blue50,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.slate500,
    marginTop: 2,
  },
  tabLabelActive: {
    color: colors.blue600,
    fontWeight: '700',
  },
});

