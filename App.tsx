import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  DrivingLicenseScreen,
  VehicleInspectionScreen,
  AadhaarScreen,
  kycApi,
  useKeyboardOffset,
} from './src/features/kyc';
import { getApiBaseUrl, setApiBaseUrl } from './src/core/network/apiClient';
import { theme } from './src/core/theme';

const { colors } = theme;
const STATUSBAR_HEIGHT = Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 28) : 0;

const TABS = [
  { id: 'vehicle', label: 'RC & Challan', icon: 'construct-outline', activeIcon: 'construct' },
  { id: 'dl', label: 'Driving License', icon: 'id-card-outline', activeIcon: 'id-card' },
  { id: 'aadhaar', label: 'Aadhaar OTP', icon: 'finger-print-outline', activeIcon: 'finger-print' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('vehicle');
  const [serverOnline, setServerOnline] = useState(false);
  const [serverUrl, setServerUrl] = useState(getApiBaseUrl());
  const [showSettings, setShowSettings] = useState(false);
  const { isKeyboardVisible } = useKeyboardOffset();

  // Health ping to backend
  const checkServer = async () => {
    try {
      await kycApi.checkHealth();
      setServerOnline(true);
    } catch {
      setServerOnline(false);
    }
  };

  useEffect(() => {
    checkServer();
    const interval = setInterval(checkServer, 8000);
    return () => clearInterval(interval);
  }, [serverUrl]);

  const handleSaveServerUrl = () => {
    if (!serverUrl.trim()) return;
    setApiBaseUrl(serverUrl.trim());
    setShowSettings(false);
    checkServer();
    Alert.alert('Backend Host Updated', `Connected to:\n${serverUrl.trim()}`);
  };

  const applyPresetIp = (url: string) => {
    setServerUrl(url);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Top Header with Active Screen Title */}
      <View style={styles.header}>
        <Text style={styles.headerScreenTitle}>
          {activeTab === 'vehicle' && 'Vehicle Inspection'}
          {activeTab === 'dl' && 'Driving License Inspection'}
          {activeTab === 'aadhaar' && 'Aadhaar Verification'}
        </Text>
      </View>

      {/* Active KYC Verification Screens */}
      <View style={styles.screenContainer}>
        {activeTab === 'vehicle' && <VehicleInspectionScreen />}
        {activeTab === 'dl' && <DrivingLicenseScreen />}
        {activeTab === 'aadhaar' && <AadhaarScreen />}
      </View>

      {/* Modern Bottom Tab Bar with EquipRent Orange Active Accent */}
      {!isKeyboardVisible && (
        <View style={styles.tabBar}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.tabButton}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.tabIconWrap, isActive && styles.tabIconWrapActive]}>
                  <Ionicons
                    name={(isActive ? tab.activeIcon : tab.icon) as any}
                    size={20}
                    color={isActive ? '#C2410C' : '#64748B'}
                  />
                </View>
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Backend IP Settings Modal */}
      <Modal visible={showSettings} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconBox}>
                <Ionicons name="wifi" size={18} color="#C2410C" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Backend API Configuration</Text>
                <Text style={styles.modalSubtitle}>Fastify Node.js Port 3100</Text>
              </View>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDesc}>
              Connect your phone to your computer's local Wi-Fi IP address:
            </Text>

            <Text style={styles.ipLabel}>FASTIFY API BASE URL</Text>
            <TextInput
              style={styles.modalInput}
              value={serverUrl}
              onChangeText={setServerUrl}
              placeholder="e.g. http://192.168.31.109:3100"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.presetHeading}>QUICK PRESETS:</Text>
            <View style={styles.modalPresetsRow}>
              <TouchableOpacity
                style={styles.modalPresetChip}
                onPress={() => applyPresetIp('http://192.168.31.109:3100')}
              >
                <Ionicons name="phone-portrait-outline" size={12} color="#C2410C" />
                <Text style={styles.modalPresetChipText}>PC Wi-Fi (192.168.31.109)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalPresetChip}
                onPress={() => applyPresetIp('http://10.0.2.2:3100')}
              >
                <Ionicons name="laptop-outline" size={12} color="#475569" />
                <Text style={styles.modalPresetChipText}>Android Emulator (10.0.2.2)</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalBtnCancel}
                onPress={() => setShowSettings(false)}
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalBtnSave}
                onPress={handleSaveServerUrl}
              >
                <Text style={styles.modalBtnSaveText}>Save & Reconnect</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: STATUSBAR_HEIGHT,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerScreenTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#C2410C', // Deep EquipRent Orange
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 6,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    width: 15,
    height: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  serverPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  serverOnline: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  serverOffline: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotGreen: {
    backgroundColor: '#10B981',
  },
  dotRed: {
    backgroundColor: '#EF4444',
  },
  serverPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  textGreen: {
    color: '#047857',
  },
  textRed: {
    color: '#B91C1C',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  tabIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapActive: {
    backgroundColor: '#FFEDD5', // Soft orange highlight
  },
  tabLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#C2410C',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  modalIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  modalDesc: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 12,
    lineHeight: 16,
  },
  ipLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 14,
  },
  presetHeading: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  modalPresetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  modalPresetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  modalPresetChipText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalBtnCancel: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnCancelText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 13,
  },
  modalBtnSave: {
    flex: 1.5,
    backgroundColor: '#C2410C',
    borderRadius: 10,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnSaveText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
