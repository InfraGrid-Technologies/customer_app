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
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  LayoutChangeEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VerifiedBadgeCard, DocumentPickerModal } from '../components';
import { theme } from '../../../core/theme';
import { useDrivingLicense } from '../hooks/useDrivingLicense';
import { useKeyboardOffset } from '../hooks/useKeyboardOffset';
import { validators } from '../../../utils/validators';

const { colors } = theme;

/**
 * Driving License Verification Screen
 *
 * Production Flow:
 * 1. Two distinct stacked rows for Front Side DL and Back Side DL (Both Mandatory).
 * 2. Uploading via Camera or Browse triggers automated AI OCR extraction.
 * 3. Once uploaded, the operator particulars UI is smoothly revealed and auto-filled.
 * 4. User reviews details, checks DPDP consent, and submits for Parivahan Sarathi verification.
 */
export function DrivingLicenseScreen() {
  const {
    dlNumber,
    setDlNumber,
    dob,
    setDob,
    frontDoc,
    backDoc,
    activeSide,
    isOcrExtracted,
    extractedName,
    handleRemoveDoc,
    openPicker,
    agreed,
    setAgreed,
    loading,
    ocrLoading,
    result,
    setResult,
    errorMsg,
    setErrorMsg,
    pickerModalVisible,
    setPickerModalVisible,
    handleVerify,
    handleCameraCapture,
    handleGalleryBrowse,
    handleFileBrowse,
  } = useDrivingLicense();

  const cleanDlNum = validators.cleanInput(dlNumber);
  const isDlValid = validators.isValidDrivingLicense(cleanDlNum);
  const isDobValid = validators.isValidDob(dob);

  const [dlTouched, setDlTouched] = useState(false);
  const [dobTouched, setDobTouched] = useState(false);
  const dobInputRef = useRef<any>(null);

  // Auto-dash formatting for Date of Birth (YYYY-MM-DD)
  const handleDobChange = (text: string) => {
    if (errorMsg) setErrorMsg(null);
    // Allow natural character deletion when backspacing
    if (text.length < dob.length) {
      setDob(text);
      return;
    }
    // Extract digits and automatically insert hyphens (YYYY-MM-DD)
    const digits = text.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 4 && digits.length <= 6) {
      formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
    } else if (digits.length > 6) {
      formatted = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
    }
    setDob(formatted);
  };

  const isFormValid = Boolean(frontDoc && backDoc && isDlValid && isDobValid && agreed && !loading);
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
        y: y !== undefined ? Math.max(0, y - 12) : 280,
        animated: true,
      });
    }, 120);
  };

  const onSubmit = () => {
    setDlTouched(true);
    setDobTouched(true);
    if (!isFormValid) return;
    handleVerify(true);
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
      {/* ROW 1: DL FRONT SIDE */}
      <View style={styles.documentRow}>
        <View style={styles.rowHeader}>
          <Text style={styles.rowLabel}>License Card (Front Side)*</Text>
          {frontDoc && (
            <View style={styles.badgeSuccess}>
              <Text style={styles.badgeSuccessText}>✓ Uploaded</Text>
            </View>
          )}
        </View>

        {frontDoc ? (
          /* Uploaded Preview State */
          <View style={styles.cardPreviewContainer}>
            <Image source={{ uri: frontDoc.uri }} style={styles.cardImagePreview} resizeMode="cover" />
            <View style={styles.cardTopBadge}>
              <View style={styles.verifiedPill}>
                <Ionicons name="checkmark-circle" size={13} color="#FFFFFF" />
                <Text style={styles.verifiedPillText}>Front Side Captured</Text>
              </View>
            </View>
            <View style={styles.cardBottomBar}>
              <TouchableOpacity
                style={styles.cardBarButton}
                onPress={() => openPicker('FRONT')}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh-outline" size={15} color="#FFFFFF" />
                <Text style={styles.cardBarButtonText}>Retake</Text>
              </TouchableOpacity>
              <View style={styles.barDivider} />
              <TouchableOpacity
                style={styles.cardBarButton}
                onPress={() => handleRemoveDoc('FRONT')}
                activeOpacity={0.8}
              >
                <Ionicons name="trash-outline" size={15} color="#FCA5A5" />
                <Text style={[styles.cardBarButtonText, { color: '#FCA5A5' }]}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Empty Card State */
          <View style={styles.emptyCardContainer}>
            <TouchableOpacity
              style={styles.emptyCardBody}
              onPress={() => openPicker('FRONT')}
              activeOpacity={0.7}
            >
              <View style={styles.emptyIconCircle}>
                <Ionicons name="cloud-upload-outline" size={32} color="#334155" />
              </View>
              <Text style={styles.emptyTitle}>Upload Front Side of License</Text>
            </TouchableOpacity>

            <View style={styles.cardActionRow}>
              <TouchableOpacity
                style={styles.btnCamera}
                onPress={() => handleCameraCapture('FRONT')}
                activeOpacity={0.85}
              >
                <Ionicons name="camera" size={15} color="#FFFFFF" />
                <Text style={styles.btnCameraText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnBrowse}
                onPress={() => handleGalleryBrowse('FRONT')}
                activeOpacity={0.85}
              >
                <Ionicons name="images-outline" size={15} color="#0F172A" />
                <Text style={styles.btnBrowseText}>Browse Files</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* ROW 2: DL BACK SIDE */}
      <View style={styles.documentRow}>
        <View style={styles.rowHeader}>
          <Text style={styles.rowLabel}>License Card (Back Side)*</Text>
          {backDoc && (
            <View style={styles.badgeSuccess}>
              <Text style={styles.badgeSuccessText}>✓ Uploaded</Text>
            </View>
          )}
        </View>

        {backDoc ? (
          /* Uploaded Preview State */
          <View style={styles.cardPreviewContainer}>
            <Image source={{ uri: backDoc.uri }} style={styles.cardImagePreview} resizeMode="cover" />
            <View style={styles.cardTopBadge}>
              <View style={styles.verifiedPill}>
                <Ionicons name="checkmark-circle" size={13} color="#FFFFFF" />
                <Text style={styles.verifiedPillText}>Back Side Captured</Text>
              </View>
            </View>
            <View style={styles.cardBottomBar}>
              <TouchableOpacity
                style={styles.cardBarButton}
                onPress={() => openPicker('BACK')}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh-outline" size={15} color="#FFFFFF" />
                <Text style={styles.cardBarButtonText}>Retake</Text>
              </TouchableOpacity>
              <View style={styles.barDivider} />
              <TouchableOpacity
                style={styles.cardBarButton}
                onPress={() => handleRemoveDoc('BACK')}
                activeOpacity={0.8}
              >
                <Ionicons name="trash-outline" size={15} color="#FCA5A5" />
                <Text style={[styles.cardBarButtonText, { color: '#FCA5A5' }]}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Empty Card State */
          <View style={styles.emptyCardContainer}>
            <TouchableOpacity
              style={styles.emptyCardBody}
              onPress={() => openPicker('BACK')}
              activeOpacity={0.7}
            >
              <View style={styles.emptyIconCircle}>
                <Ionicons name="cloud-upload-outline" size={32} color="#334155" />
              </View>
              <Text style={styles.emptyTitle}>Upload Back Side of License</Text>
            </TouchableOpacity>

            <View style={styles.cardActionRow}>
              <TouchableOpacity
                style={[styles.btnCamera, { backgroundColor: '#334155' }]}
                onPress={() => handleCameraCapture('BACK')}
                activeOpacity={0.85}
              >
                <Ionicons name="camera" size={15} color="#FFFFFF" />
                <Text style={styles.btnCameraText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnBrowse}
                onPress={() => handleGalleryBrowse('BACK')}
                activeOpacity={0.85}
              >
                <Ionicons name="images-outline" size={15} color="#0F172A" />
                <Text style={styles.btnBrowseText}>Browse Files</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* AI OCR Processing Indicator */}
      {ocrLoading && (
        <View style={styles.ocrLoadingBox}>
          <ActivityIndicator size="small" color="#EA580C" />
          <Text style={styles.ocrLoadingText}>Analyzing license card with AI OCR & extracting particulars...</Text>
        </View>
      )}

      {/* 3. Form Fields: Visible Upfront for Direct Manual Typing or OCR Auto-Populate */}
      <View style={styles.revealedSection}>
        <View style={styles.sectionDivider} />

        {/* Section Header */}
        <View style={styles.reviewHeaderRow}>
          {isOcrExtracted && (
            <View style={styles.ocrExtractedBadge}>
              <Ionicons name="checkmark-circle" size={13} color="#15803D" />
              <Text style={styles.ocrExtractedBadgeText}>Auto-Extracted from License Card (AI OCR)</Text>
            </View>
          )}
          <Text style={styles.reviewTitle}>Driver Particulars</Text>
          <Text style={styles.reviewSubtitle}>
            {isOcrExtracted
              ? 'Please review the auto-populated details below. You can edit any field if required.'
              : 'Enter your driving license details below or upload both license photos (front & back) above for auto-fill.'}
          </Text>
        </View>

        {/* Field 1: Driving License Number */}
        <View
          style={styles.fieldGroup}
          onLayout={(e) => handleLayout('dlNumber', e)}
        >
          <View style={styles.fieldHeaderRow}>
            <View style={styles.fieldHeaderLeft}>
              <Text style={styles.fieldLabel}>Driving License Number*</Text>
            </View>
          </View>

          <View
            style={[
              styles.plateInputContainer,
              dlTouched && dlNumber.trim().length > 0 && !isDlValid ? styles.inputWarningBorder : null,
              isDlValid ? styles.inputSuccessBorder : null,
              errorMsg?.includes('License') ? styles.inputError : null,
            ]}
          >
            <TextInput
              style={styles.plateInput}
              value={dlNumber}
              onChangeText={(text) => {
                setDlNumber(text);
                if (errorMsg) setErrorMsg(null);
              }}
              onFocus={() => {
                setDlTouched(false);
                scrollToField('dlNumber');
              }}
              onBlur={() => setDlTouched(true)}
              placeholder="e.g. MH1220180000000"
              placeholderTextColor="#94A3B8"
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => dobInputRef.current?.focus()}
              blurOnSubmit={false}
            />
            {isDlValid && (
              <Ionicons name="checkmark-circle" size={18} color="#10B981" style={{ marginRight: 6 }} />
            )}
          </View>
          {dlTouched && dlNumber.trim().length > 0 && !isDlValid && (
            <View style={styles.inlineWarningRow}>
              <Ionicons name="alert-circle" size={14} color="#EA580C" />
              <Text style={styles.inlineWarningText}>
                Invalid Driving License format.
              </Text>
            </View>
          )}
        </View>

        {/* Field 2: Date of Birth */}
        <View
          style={styles.fieldGroup}
          onLayout={(e) => handleLayout('dob', e)}
        >
          <View style={styles.fieldHeaderRow}>
            <View style={styles.fieldHeaderLeft}>
              <Text style={styles.fieldLabel}>Date of Birth (YYYY-MM-DD)*</Text>
            </View>
          </View>

          <View
            style={[
              styles.standardInputContainer,
              dobTouched && dob.trim().length > 0 && !isDobValid ? styles.inputWarningBorder : null,
              isDobValid ? styles.inputSuccessBorder : null,
              errorMsg?.includes('birth') ? styles.inputError : null,
            ]}
          >
            <TextInput
              ref={dobInputRef}
              style={styles.standardInput}
              value={dob}
              onChangeText={handleDobChange}
              onFocus={() => {
                setDobTouched(false);
                scrollToField('dob');
              }}
              onBlur={() => setDobTouched(true)}
              placeholder="YYYY-MM-DD (e.g. 1995-01-01)"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={10}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
            {isDobValid && (
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            )}
          </View>
          {dobTouched && dob.trim().length > 0 && !isDobValid && (
            <View style={styles.inlineWarningRow}>
              <Ionicons name="alert-circle" size={14} color="#EA580C" />
              <Text style={styles.inlineWarningText}>
                Invalid Date of Birth format (YYYY-MM-DD).
              </Text>
            </View>
          )}
        </View>

        {/* Inline Error Message */}
        {errorMsg && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color="#DC2626" />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {/* DPDP Consent Checkbox Card */}
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
              I authorize EquipRent to verify my driving license with Parivahan Sarathi solely for equipment qualification.{' '}
              <Text
                style={styles.readMoreLink}
                onPress={() =>
                  Alert.alert(
                    'Verification Policy',
                    'Driving license records are verified with Parivahan Sarathi in compliance with government transport regulations and DPDP Act 2023 guidelines.'
                  )
                }
              >
                Read More
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* 4. Verification Result Card (Positioned between Consent & Submit Button) */}
        {result && <VerifiedBadgeCard result={result} style={styles.resultCard} />}

        {/* Primary Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, !isFormValid ? styles.submitButtonDisabled : null]}
          onPress={onSubmit}
          disabled={!isFormValid}
          activeOpacity={0.88}
        >
          <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Submit for Operator Verification</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Universal Document Picker Modal */}
      <DocumentPickerModal
        visible={pickerModalVisible}
        title={`Upload DL ${activeSide === 'FRONT' ? 'Front Side' : 'Back Side'}`}
        subtitle={`Photograph or browse ${activeSide === 'FRONT' ? 'front' : 'back'} of Driving License:`}
        onClose={() => setPickerModalVisible(false)}
        onSelectCamera={handleCameraCapture}
        onSelectGallery={handleGalleryBrowse}
        onSelectFiles={handleFileBrowse}
      />
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
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

  // Document Section
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
  sectionSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 3,
    marginBottom: 14,
    lineHeight: 18,
  },

  // Document Rows (Stacked)
  documentRow: {
    marginBottom: 14,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  rowLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  badgeRequired: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeRequiredText: {
    color: '#DC2626',
    fontSize: 10.5,
    fontWeight: '700',
  },
  badgeSuccess: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeSuccessText: {
    color: '#15803D',
    fontSize: 10.5,
    fontWeight: '700',
  },

  // Empty Card Slot
  emptyCardContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 12,
  },
  emptyCardBody: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  cardActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  btnCamera: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    paddingVertical: 9,
    borderRadius: 8,
  },
  btnCameraText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  btnBrowse: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 9,
    borderRadius: 8,
  },
  btnBrowseText: {
    color: '#0F172A',
    fontSize: 12.5,
    fontWeight: '700',
  },

  // Uploaded Preview Card
  cardPreviewContainer: {
    height: 156,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
  },
  cardImagePreview: {
    width: '100%',
    height: '100%',
  },
  cardTopBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(21, 128, 61, 0.94)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  verifiedPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  cardBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  cardBarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  cardBarButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  barDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },

  // Loading Banner
  ocrLoadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#FFF7ED',
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  ocrLoadingText: {
    color: '#C2410C',
    fontSize: 12,
    fontWeight: '600',
  },

  // Revealed Particulars
  revealedSection: {
    marginTop: 4,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  reviewHeaderRow: {
    marginBottom: 12,
  },
  ocrExtractedBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    marginBottom: 6,
  },
  ocrExtractedBadgeText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '700',
  },
  manualEntryBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    marginBottom: 6,
  },
  manualEntryBadgeText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  reviewSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },

  metaCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaLabel: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '700',
    flex: 1,
  },

  fieldGroup: {
    marginBottom: 14,
  },
  fieldHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  fieldHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  mandatoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
  fieldHintRight: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },

  plateInputContainer: {
    backgroundColor: '#F0F4FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 10,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  indBadge: {
    backgroundColor: '#E0E7FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  indText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E3A8A',
    letterSpacing: 0.5,
  },
  plateInput: {
    flex: 1,
    paddingHorizontal: 0,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 1.2,
  },

  standardInputContainer: {
    backgroundColor: '#F4F7FB',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  standardInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: 0.8,
  },

  inputError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
    flex: 1,
  },

  consentCard: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 12,
    padding: 12,
    marginVertical: 14,
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

  resultCard: {
    marginTop: 0,
    marginBottom: 16,
  },

  submitButton: {
    backgroundColor: '#C2410C',
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 4,
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
  inlineWarningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingHorizontal: 2,
  },
  inlineWarningText: {
    fontSize: 11.5,
    color: '#EA580C',
    fontWeight: '500',
    flex: 1,
    lineHeight: 16,
  },
  inputWarningBorder: {
    borderColor: '#FB923C',
    backgroundColor: '#FFF7ED',
  },
  inputSuccessBorder: {
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
  },
});
