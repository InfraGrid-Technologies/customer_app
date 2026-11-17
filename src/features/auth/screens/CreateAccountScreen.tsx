import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Telangana',
  'Karnataka',
  'Maharashtra',
  'Tamil Nadu',
  'Gujarat',
  'Delhi',
  'Uttar Pradesh',
  'Rajasthan',
  'Madhya Pradesh',
  'West Bengal',
  'Haryana',
  'Punjab',
  'Kerala',
  'Odisha',
];

interface CreateAccountScreenProps {
  onBack?: () => void;
  onSuccess?: (accountData: any) => void;
}

export function CreateAccountScreen({ onBack, onSuccess }: CreateAccountScreenProps) {
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [gstin, setGstin] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [billingState, setBillingState] = useState('');
  const [city, setCity] = useState('Hyderabad');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mobileInputRef = useRef<any>(null);
  const businessInputRef = useRef<any>(null);
  const gstinInputRef = useRef<any>(null);
  const cityInputRef = useRef<any>(null);

  const handleSubmit = () => {
    setErrorMsg(null);
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!mobileNumber.trim() || mobileNumber.replace(/\D/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('Please accept the Terms & Conditions to create your account.');
      return;
    }

    const payload = {
      fullName: fullName.trim(),
      mobileNumber: `+91${mobileNumber.replace(/\D/g, '')}`,
      businessName: businessName.trim() || null,
      gstin: gstin.trim().toUpperCase() || null,
      billingAddress: billingAddress.trim() || null,
      billingState: billingState || null,
      city: city.trim(),
    };

    if (onSuccess) {
      onSuccess(payload);
    } else {
      Alert.alert(
        'Account Created Successfully! 🎉',
        `Welcome to EquipRent, ${payload.fullName}!\nProceeding to KYC Verification workflow.`,
        [{ text: 'Continue' }]
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets={true}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header matching AND-003 mockup */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack || (() => {})}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create your account</Text>
        </View>

        <View style={styles.card}>
          {/* Full Name * */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Full name *</Text>
            <TextInput
              style={[styles.input, errorMsg?.includes('name') ? styles.inputError : null]}
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="e.g. Ramesh Kumar"
              placeholderTextColor="#94A3B8"
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => mobileInputRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>

          {/* Mobile Number * */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Mobile number *</Text>
            <View style={styles.phoneInputRow}>
              <View style={styles.countryCodeBadge}>
                <Text style={styles.countryCodeText}>+91</Text>
              </View>
              <TextInput
                ref={mobileInputRef}
                style={[
                  styles.phoneInput,
                  errorMsg?.includes('mobile') ? styles.inputError : null,
                ]}
                value={mobileNumber}
                onChangeText={(text) => {
                  setMobileNumber(text);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="98765 43210"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                maxLength={12}
                returnKeyType="next"
                onSubmitEditing={() => businessInputRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>
          </View>

          {/* Section Header: Additional details (optional) */}
          <Text style={styles.sectionSubtitle}>Additional details (optional)</Text>

          {/* Business Name (Optional) */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Business Name (Optional)</Text>
            <TextInput
              ref={businessInputRef}
              style={styles.input}
              value={businessName}
              onChangeText={setBusinessName}
              placeholder="e.g. ABC Constructions"
              placeholderTextColor="#94A3B8"
              returnKeyType="next"
              onSubmitEditing={() => gstinInputRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>

          {/* GSTIN (Optional) */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>GSTIN (Optional)</Text>
            <TextInput
              ref={gstinInputRef}
              style={styles.input}
              value={gstin}
              onChangeText={setGstin}
              placeholder="29ABCDE1234F1Z5"
              placeholderTextColor="#94A3B8"
              autoCapitalize="characters"
              returnKeyType="next"
            />
          </View>

          {/* Billing address (Optional) */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Billing address (Optional)</Text>
            <TextInput
              style={styles.textArea}
              value={billingAddress}
              onChangeText={setBillingAddress}
              placeholder=""
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Billing state / UT dropdown */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Billing state / UT</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowStateDropdown(true)}
              activeOpacity={0.8}
            >
              <View style={styles.dropdownLeft}>
                <Ionicons name="location-sharp" size={16} color="#EA580C" />
                <Text
                  style={[
                    styles.dropdownText,
                    !billingState && styles.dropdownPlaceholder,
                  ]}
                >
                  {billingState || 'Select state (optional)'}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* City */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>City</Text>
            <TextInput
              ref={cityInputRef}
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="Hyderabad"
              placeholderTextColor="#94A3B8"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
        </View>

        {/* Checkbox: Terms & Conditions */}
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => {
            setAgreeTerms(!agreeTerms);
            if (errorMsg) setErrorMsg(null);
          }}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, agreeTerms ? styles.checkboxChecked : null]}>
            {agreeTerms && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
          </View>
          <Text style={styles.checkboxLabel}>I agree to the Terms & Conditions.</Text>
        </TouchableOpacity>

        {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

        {/* Submit Button in Vibrant EquipRent Orange */}
        <TouchableOpacity
          style={[styles.submitButton, !agreeTerms ? styles.submitButtonDisabled : null]}
          onPress={handleSubmit}
          activeOpacity={0.88}
        >
          <Text style={styles.submitButtonText}>Create Account</Text>
        </TouchableOpacity>
      </View>

      {/* State Picker Modal */}
      <Modal visible={showStateDropdown} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select State / UT</Text>
              <TouchableOpacity onPress={() => setShowStateDropdown(false)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 300 }}>
              {INDIAN_STATES.map((state) => (
                <TouchableOpacity
                  key={state}
                  style={[
                    styles.stateItem,
                    billingState === state ? styles.stateItemActive : null,
                  ]}
                  onPress={() => {
                    setBillingState(state);
                    setShowStateDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.stateItemText,
                      billingState === state ? styles.stateItemTextActive : null,
                    ]}
                  >
                    {state}
                  </Text>
                  {billingState === state && (
                    <Ionicons name="checkmark-circle" size={18} color="#C2410C" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
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
    padding: 16,
    paddingBottom: 16,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    marginTop: 4,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 7,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    color: '#0F172A',
  },
  inputError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  phoneInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  countryCodeBadge: {
    width: 64,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EA580C',
    marginTop: 4,
    marginBottom: 16,
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingTop: 10,
    height: 72,
    fontSize: 14,
    color: '#0F172A',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
  },
  dropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  dropdownPlaceholder: {
    color: '#64748B',
    fontWeight: '400',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    marginBottom: 16,
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
  checkboxLabel: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginBottom: 12,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#C2410C',
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C2410C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
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
    maxHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  stateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  stateItemActive: {
    backgroundColor: '#FFF7ED',
  },
  stateItemText: {
    fontSize: 14,
    color: '#334155',
  },
  stateItemTextActive: {
    color: '#C2410C',
    fontWeight: '700',
  },
});

