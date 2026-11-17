import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface DocumentPickerModalProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  onClose: () => void;
  onSelectCamera: () => void;
  onSelectGallery: () => void;
  onSelectFiles: () => void;
}

/**
 * DocumentPickerModal
 *
 * Cross-platform selection sheet for physical document capture:
 * 1. Native Camera (`expo-image-picker`)
 * 2. Photo Gallery (`expo-image-picker`)
 * 3. Local Files & PDFs (`expo-document-picker`)
 */
export function DocumentPickerModal({
  visible,
  title = 'Upload Document',
  subtitle = 'Choose how you would like to provide your verification document:',
  onClose,
  onSelectCamera,
  onSelectGallery,
  onSelectFiles,
}: DocumentPickerModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheetContainer} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="document-text" size={20} color="#EA580C" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Options */}
          <View style={styles.optionsList}>
            {/* Option 1: Take Photo with Camera */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => {
                onClose();
                setTimeout(onSelectCamera, 150);
              }}
              activeOpacity={0.75}
            >
              <View style={[styles.optionIconBox, { backgroundColor: '#FFEDD5' }]}>
                <Ionicons name="camera" size={22} color="#EA580C" />
              </View>
              <View style={styles.optionTextBox}>
                <Text style={styles.optionTitle}>Take Photo with Camera</Text>
                <Text style={styles.optionDesc}>Photograph the physical card with your device camera</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            {/* Option 2: Choose from Photo Gallery */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => {
                onClose();
                setTimeout(onSelectGallery, 150);
              }}
              activeOpacity={0.75}
            >
              <View style={[styles.optionIconBox, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="images" size={22} color="#0284C7" />
              </View>
              <View style={styles.optionTextBox}>
                <Text style={styles.optionTitle}>Choose from Photo Gallery</Text>
                <Text style={styles.optionDesc}>Select an existing image from Google Photos or Gallery</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            {/* Option 3: Browse Device Files & PDFs */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => {
                onClose();
                setTimeout(onSelectFiles, 150);
              }}
              activeOpacity={0.75}
            >
              <View style={[styles.optionIconBox, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="folder-open" size={22} color="#16A34A" />
              </View>
              <View style={styles.optionTextBox}>
                <Text style={styles.optionTitle}>Browse Phone Files / PDFs</Text>
                <Text style={styles.optionDesc}>Pick digital RC/DL from Downloads or Google Drive</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Cancel Button */}
          <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 28,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  optionsList: {
    gap: 10,
    marginTop: 4,
    marginBottom: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionTextBox: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  optionDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
});

export default DocumentPickerModal;
