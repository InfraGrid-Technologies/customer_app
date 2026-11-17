/**
 * Mobile Document & Camera Capture Utility
 *
 * ROLE:
 * Bridges native device hardware (Phone Camera, Photo Gallery, System Document/File Provider)
 * with the AI OCR pipeline.
 *
 * CROSS-PLATFORM SUPPORT:
 * - Native Android & iOS: Direct hardware camera launch, native gallery selection, and system files.
 * - Web / Desktop: HTML5 file/camera input with FileReader Base64 conversion.
 * - Fallbacks: Multi-layered Base64 extraction (asset.base64 -> expo-file-system -> fetch blob reader).
 */

import { Platform, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

export interface CapturedDocument {
  uri: string;
  base64: string;
  fileName: string;
  mimeType: string;
  fileSize?: number;
}

/**
 * Universal Base64 Reader: Safely converts any file/blob URI into a pure Base64 string
 * without external prefixes, working across Android, iOS, and Web.
 */
async function readUriAsBase64(uri: string, existingBase64?: string | null): Promise<string> {
  // 1. If base64 was already populated by ImagePicker, use it directly
  if (existingBase64 && existingBase64.length > 50) {
    // Strip possible data URI prefix if present
    const commaIdx = existingBase64.indexOf(',');
    return commaIdx >= 0 ? existingBase64.slice(commaIdx + 1) : existingBase64;
  }

  if (!uri) return '';

  // 2. Web Browser: Fetch blob and read via HTML5 FileReader
  if (Platform.OS === 'web') {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          const commaIdx = dataUrl.indexOf(',');
          resolve(commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl);
        };
        reader.onerror = () => reject(new Error('Failed reading file as Base64 on web.'));
        reader.readAsDataURL(blob);
      });
    } catch (webErr: any) {
      console.warn('[documentCapture] Web FileReader failed:', webErr?.message);
      return '';
    }
  }

  // 3. Native Android / iOS: Read using expo-file-system legacy
  try {
    const rawBase64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return rawBase64;
  } catch (fsErr: any) {
    console.warn('[documentCapture] FileSystem.readAsStringAsync failed, trying fetch blob fallback:', fsErr?.message);

    // 4. Native Fallback: Some content:// URIs can be read via fetch(uri).blob()
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          const commaIdx = dataUrl.indexOf(',');
          resolve(commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl);
        };
        reader.onerror = () => reject(new Error('Fallback file read failed.'));
        reader.readAsDataURL(blob);
      });
    } catch (fallbackErr: any) {
      console.error('[documentCapture] All Base64 readers failed for URI:', uri, fallbackErr);
      throw new Error(`Unable to read document file: ${fsErr?.message || 'File system error'}`);
    }
  }
}

export const documentCapture = {
  /**
   * Directly opens the phone camera for capturing a physical photo of a DL or RC smart card.
   */
  async captureWithCamera(): Promise<CapturedDocument | null> {
    try {
      // 1. Permission check (Only needed on Native Android/iOS; Web handles permissions on action)
      if (Platform.OS !== 'web') {
        const currentPerm = await ImagePicker.getCameraPermissionsAsync();
        if (!currentPerm.granted) {
          const reqPerm = await ImagePicker.requestCameraPermissionsAsync();
          if (!reqPerm.granted) {
            Alert.alert(
              'Camera Permission Required',
              'Please allow camera access in your device settings to photograph physical documents for verification.'
            );
            return null;
          }
        }
      }

      // 2. Launch system camera UI
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.85,
        base64: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null; // User canceled or backed out
      }

      const asset = result.assets[0];
      const base64 = await readUriAsBase64(asset.uri, asset.base64);

      if (!base64) {
        throw new Error('Failed to extract image data from camera capture.');
      }

      return {
        uri: asset.uri,
        base64,
        fileName: asset.fileName || `camera_doc_${Date.now()}.jpg`,
        mimeType: asset.mimeType || 'image/jpeg',
        fileSize: asset.fileSize,
      };
    } catch (err: any) {
      console.error('[documentCapture] captureWithCamera error:', err);
      Alert.alert('Camera Error', err.message || 'Could not open phone camera.');
      return null;
    }
  },

  /**
   * Opens the device Photo Library / Gallery to select an existing photo.
   */
  async browsePhotoGallery(): Promise<CapturedDocument | null> {
    try {
      // 1. Permission check for Photo Library (Native only)
      if (Platform.OS !== 'web') {
        const currentPerm = await ImagePicker.getMediaLibraryPermissionsAsync();
        if (!currentPerm.granted) {
          const reqPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!reqPerm.granted) {
            Alert.alert(
              'Photo Library Permission Required',
              'Please allow photo library access in your device settings to select document photos.'
            );
            return null;
          }
        }
      }

      // 2. Launch Image Library
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.85,
        base64: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const asset = result.assets[0];
      const base64 = await readUriAsBase64(asset.uri, asset.base64);

      if (!base64) {
        throw new Error('Failed to extract image data from selected photo.');
      }

      return {
        uri: asset.uri,
        base64,
        fileName: asset.fileName || `gallery_doc_${Date.now()}.jpg`,
        mimeType: asset.mimeType || 'image/jpeg',
        fileSize: asset.fileSize,
      };
    } catch (err: any) {
      console.error('[documentCapture] browsePhotoGallery error:', err);
      Alert.alert('Gallery Error', err.message || 'Could not open photo gallery.');
      return null;
    }
  },

  /**
   * Opens the device system document manager (Downloads, Google Drive, iCloud, Files, PDFs, Docs).
   */
  async browsePhoneDocuments(): Promise<CapturedDocument | null> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const asset = result.assets[0];
      const base64 = await readUriAsBase64(asset.uri);

      if (!base64) {
        throw new Error('Failed to read file data from chosen document.');
      }

      const fileName = asset.name || `doc_${Date.now()}`;
      const isPdf = fileName.toLowerCase().endsWith('.pdf');
      const mimeType = asset.mimeType || (isPdf ? 'application/pdf' : 'image/jpeg');

      return {
        uri: asset.uri,
        base64,
        fileName,
        mimeType,
        fileSize: asset.size,
      };
    } catch (err: any) {
      console.error('[documentCapture] browsePhoneDocuments error:', err);
      Alert.alert('File Browser Error', err.message || 'Could not browse phone documents.');
      return null;
    }
  },

  /**
   * Generates a sample document for instant sandbox / local testing
   */
  getDemoDocument(type: 'DRIVING_LICENSE' | 'VEHICLE_RC'): CapturedDocument {
    const isDl = type === 'DRIVING_LICENSE';
    return {
      uri: 'demo://sample',
      base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      fileName: isDl ? 'demo_dl_smart_card.jpg' : 'demo_vehicle_rc.jpg',
      mimeType: 'image/jpeg',
      fileSize: 1024,
    };
  },
};

export default documentCapture;
