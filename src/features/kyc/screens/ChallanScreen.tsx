import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Modal,
  LayoutChangeEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DPDPConsentCard } from '../components/DPDPConsentCard';
import { VerifiedBadgeCard } from '../components/VerifiedBadgeCard';
import { VehicleTypeDropdownModal } from '../components/VehicleTypeDropdownModal';
import { kycApi } from '../services/kycApi';
import { theme } from '../../../core/theme';
import { VEHICLE_CATEGORIES, findRtoClassForType, findCategoryForType } from '../constants/vehicleTaxonomy';
import { useKeyboardOffset } from '../hooks/useKeyboardOffset';
import { validators } from '../../../utils/validators';

const { colors } = theme;

export function ChallanScreen() {
  const [vehicleCategory, setVehicleCategory] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [rcNumber, setRcNumber] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [vehicleTypeModalVisible, setVehicleTypeModalVisible] = useState(false);

  const rcInputRef = useRef<any>(null);
  const selectedRtoClass = findRtoClassForType(vehicleType);

  const cleanRcNumber = rcNumber.replaceAll(/[\s-]/g, '').toUpperCase();
  const isVehicleValid = validators.isValidVehicleNumber(cleanRcNumber);

  const isFormValid = Boolean(
    vehicleType.trim().length >= 2 &&
    isVehicleValid &&
    agreed &&
    !loading
  );

  const handleVerify = async (forceRefresh = false) => {
    if (!vehicleType.trim()) {
      Alert.alert('Required', 'Please enter the vehicle type.');
      return;
    }
    const effectiveCategory = vehicleCategory || findCategoryForType(vehicleType) || 'CEV';
    if (!isVehicleValid) {
      Alert.alert('Required', 'Please enter a valid Vehicle Registration Number (e.g. MH 12 AB 1234).');
      return;
    }
    if (!agreed) {
      Alert.alert(
        'Consent Required',
        'Fetching national and state traffic e-challan violations requires driver/owner consent.'
      );
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await kycApi.verifyChallan({
        rcNumber: cleanRcNumber,
        vehicleCategory: effectiveCategory,
        vehicleType: vehicleType.trim(),
        consent: {
          agreed: true,
          noticeVersion: 'CHALLAN_NOTICE_V1.0',
          noticeText: 'I consent to checking pending traffic challans across national and state portals for machinery safety compliance.',
        },
        forceRefresh,
      });

      setResult(response);
    } catch (err: any) {
      Alert.alert('Challan Verification Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

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
        y: y !== undefined ? Math.max(0, y - 12) : 220,
        animated: true,
      });
    }, 120);
  };

  return (
    <View style={styles.keyboardContainer}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: dynamicPaddingBottom }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>E-Challan Traffic Compliance</Text>
              <Text style={styles.cardSubtitle}>Traffic Police Violations & Court Impounds</Text>
            </View>
            <View style={styles.badgeBox}>
              <Ionicons name="speedometer" size={20} color={colors.primary} />
            </View>
          </View>

          {/* Vehicle Type Dropdown (14 Types with Category) */}
          <View
            style={styles.formGroup}
            onLayout={(e) => handleLayout('vehicleType', e)}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={styles.label}>Vehicle Type*</Text>
              {selectedRtoClass && (
                <View style={styles.rtoBadge}>
                  <Text style={styles.rtoBadgeText}>COV: {selectedRtoClass}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.dropdownButton, vehicleType ? styles.dropdownButtonSelected : null]}
              onPress={() => setVehicleTypeModalVisible(true)}
              activeOpacity={0.8}
            >
              <View style={styles.dropdownMainContent}>
                {vehicleType ? (
                  <View style={styles.selectedTypeRow}>
                    <Text style={styles.dropdownText} numberOfLines={1}>
                      {vehicleType}
                    </Text>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>
                        COV: {vehicleCategory || findCategoryForType(vehicleType)}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.dropdownPlaceholder} numberOfLines={1}>
                    Select Vehicle Type (13 Equipment Types)*
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-down" size={18} color={colors.slate500} style={styles.dropdownChevron} />
            </TouchableOpacity>
          </View>

          <View
            style={styles.formGroup}
            onLayout={(e) => handleLayout('rcNumber', e)}
          >
            <Text style={styles.label}>Vehicle registration number *</Text>
            <TextInput
              ref={rcInputRef}
              style={styles.input}
              value={rcNumber}
              onChangeText={setRcNumber}
              onFocus={() => scrollToField('rcNumber')}
              placeholder="e.g. MH 12 AB 1234"
              placeholderTextColor={colors.slate400}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
            <Text style={styles.helperText}>
              Scans national Parivahan and state traffic police databases for unpaid fines.
            </Text>
          </View>

          {/* Mandatory Verification Consent */}
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
                I authorize equiprent team to verify my challan.{' '}
                <Text
                  style={styles.readMoreLink}
                  onPress={() => Alert.alert('Verification Terms & Policy', 'Traffic violation records are verified across state and national portals in compliance with transport safety and DPDP regulations.')}
                >
                  Read More
                </Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Primary Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, !isFormValid ? styles.submitButtonDisabled : null]}
            onPress={() => handleVerify(false)}
            disabled={!isFormValid}
            activeOpacity={0.88}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Check pending traffic challans</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Verification Result Badge */}
        {result && <VerifiedBadgeCard result={result} />}

        {/* Vehicle Type Dropdown Modal (14 Fleet Equipment Types) */}
        <VehicleTypeDropdownModal
          visible={vehicleTypeModalVisible}
          selectedType={vehicleType}
          onSelect={(item) => {
            setVehicleType(item.name);
            setVehicleCategory(item.covCode);
          }}
          onClose={() => setVehicleTypeModalVisible(false)}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 14,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  badgeBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formGroup: {
    marginBottom: 14,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
  },
  dropdownButtonSelected: {
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  dropdownButtonActive: {
    borderColor: '#EA580C',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  dropdownMainContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  selectedTypeRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
  },
  dropdownChevron: {
    marginLeft: 'auto',
  },
  inlineDropdownCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: '#EA580C',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  inlineDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginVertical: 2,
    gap: 10,
  },
  inlineDropdownItemActive: {
    backgroundColor: '#FFF7ED',
  },
  inlineItemTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#334155',
  },
  inlineItemTitleActive: {
    color: '#EA580C',
    fontWeight: '700',
  },
  inlineItemSub: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },
  dropdownDisabled: {
    backgroundColor: '#F1F5F9',
    opacity: 0.65,
  },
  dropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 7,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  helperText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
  },
  submitButton: {
    backgroundColor: colors.primary, // Vibrant EquipRent Orange (#c2410c)
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: colors.primary,
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
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  consentCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: 12,
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
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  consentText: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    fontWeight: '500',
  },
  readMoreLink: {
    color: colors.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  // Test Scenario Styles
  scenarioContainer: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 12,
    padding: 10,
    marginTop: 4,
    marginBottom: 16,
  },
  scenarioHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  scenarioTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9A3412',
    flex: 1,
  },
  freeBadge: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  freeBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  scenarioChipsRow: {
    gap: 8,
    paddingVertical: 2,
  },
  scenarioChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FDBA74',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  scenarioChipActive: {
    borderColor: '#EA580C',
    backgroundColor: '#FFEDD5',
  },
  scenarioChipEmoji: {
    fontSize: 16,
  },
  scenarioChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  scenarioChipTextActive: {
    color: '#C2410C',
  },
  scenarioChipSub: {
    fontSize: 9.5,
    color: '#64748B',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  typeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 6,
    gap: 12,
  },
  typeItemActive: {
    backgroundColor: '#FFF7ED',
  },
  typeItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  typeItemTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  typeItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 6,
  },
  rtoBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  rtoBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  dropdownPlaceholder: {
    color: '#94A3B8',
    fontWeight: '400',
  },
  categoryBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    flexShrink: 0,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
  },
});
