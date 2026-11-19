/**
 * KYC Feature Slice Hook: useDrivingLicense
 *
 * Headless business logic for Driving License verification & AI OCR scanning.
 * Manages mandatory front/back document attachments, AI OCR extraction, and Parivahan Sarathi validation.
 */

import { useState } from "react";
import { Alert } from "react-native";
import { kycApi } from "../services/kycApi";
import { validators } from "../../../utils/validators";
import { documentCapture, type CapturedDocument } from "../../../utils";

export function useDrivingLicense() {
  const [dlNumber, setDlNumber] = useState("");
  const [dob, setDob] = useState("");
  const [frontDoc, setFrontDoc] = useState<CapturedDocument | null>(null);
  const [backDoc, setBackDoc] = useState<CapturedDocument | null>(null);
  const [activeSide, setActiveSide] = useState<"FRONT" | "BACK">("FRONT");
  const [isOcrExtracted, setIsOcrExtracted] = useState<boolean>(false);
  const [extractedName, setExtractedName] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pickerModalVisible, setPickerModalVisible] = useState(false);

  const cleanDlNumber = dlNumber.replace(/[\s-]/g, "").toUpperCase();

  const handleVerify = async (forceRefresh = true) => {
    setErrorMsg(null);

    if (!frontDoc || !backDoc) {
      setErrorMsg(
        "Both Front and Back photos of the Driving License card are mandatory.",
      );
      Alert.alert(
        "Documents Required",
        "Please upload clear photos of both Front and Back sides of your physical Driving License.",
      );
      return;
    }

    // 1. Fail-fast client validation: stops invalid strings (e.g. fewfegrgr48498) at ₹0 cost
    if (!validators.isValidDrivingLicense(cleanDlNumber)) {
      const message =
        "Invalid Driving License format. Expected Parivahan format (e.g. TS0920210001234 or TS01620240001534).";
      setErrorMsg(message);
      Alert.alert("Invalid License Number", message);
      return; // ⛔ BLOCKED LOCALLY! ₹0 spent.
    }

    if (!validators.isValidDob(dob)) {
      setErrorMsg(
        "Date of birth must be in YYYY-MM-DD format (required by Parivahan Sarathi).",
      );
      Alert.alert(
        "Invalid Date of Birth",
        "Please enter Date of Birth in YYYY-MM-DD format (e.g. 1995-05-15).",
      );
      return;
    }

    if (!agreed) {
      Alert.alert(
        "Consent Required",
        "Verifying driver machinery operator qualifications requires your explicit consent.",
      );
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await kycApi.verifyDrivingLicense({
        dlNumber: cleanDlNumber,
        dob: dob.trim(),
        frontDocument: frontDoc
          ? {
              fileBase64: frontDoc.base64,
              originalFilename: frontDoc.fileName,
              mimeType: frontDoc.mimeType || "image/jpeg",
            }
          : null,
        backDocument: backDoc
          ? {
              fileBase64: backDoc.base64,
              originalFilename: backDoc.fileName,
              mimeType: backDoc.mimeType || "image/jpeg",
            }
          : null,
        consent: {
          agreed: true,
          noticeVersion: "DL_NOTICE_V1.0",
          noticeText:
            "I authorize EquipRent to verify my driving license with Parivahan solely for equipment qualification.",
        },
        forceRefresh,
      });

      setResult(response);
    } catch (err: any) {
      Alert.alert(
        "Verification Failed",
        err.message || "Could not verify driving license.",
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Processes captured/browsed Driving License document:
   * - Auto-fill fields ONLY after uploading BOTH front and back images.
   * - When both sides are uploaded, the front side is analyzed by Surepass AI OCR
   *   to extract license number, DOB, and operator name.
   * - The back side is securely retained for statutory DPDP compliance.
   */
  const processDocumentOcr = async (
    doc: CapturedDocument,
    side: "FRONT" | "BACK",
  ) => {
    const updatedFront = side === "FRONT" ? doc : frontDoc;
    const updatedBack = side === "BACK" ? doc : backDoc;

    if (side === "FRONT") {
      setFrontDoc(doc);
    } else {
      setBackDoc(doc);
    }

    // Auto-fill fields ONLY after uploading BOTH front and back images
    if (!updatedFront || !updatedBack) {
      setIsOcrExtracted(false);
      return;
    }

    setOcrLoading(true);
    try {
      const ocrRes = await kycApi.ocrDrivingLicense({
        imageBase64: updatedFront.base64,
        mimeType: updatedFront.mimeType || "image/jpeg",
        consent: {
          agreed: true,
          noticeVersion: "DL_OCR_V1.0",
          noticeText: "User consent for Driving License OCR extraction",
        },
      });

      if (ocrRes.success && ocrRes.data) {
        setIsOcrExtracted(true);
        if (ocrRes.data.dlNumber) setDlNumber(ocrRes.data.dlNumber);
        if (ocrRes.data.dob) setDob(ocrRes.data.dob);
        if (ocrRes.data.name) setExtractedName(ocrRes.data.name);
      } else {
        setIsOcrExtracted(false);
        Alert.alert(
          "Invalid Document Image",
          ocrRes.data?.message ||
            ocrRes.message ||
            "The uploaded image does not appear to be an official Driving License. Please upload a clear photo of your physical card.",
        );
      }
    } catch (err: any) {
      setIsOcrExtracted(false);
      const errMsg =
        err?.message ||
        "Invalid Document Image: The uploaded photo does not appear to be a valid physical Driving License. Please ensure your physical card is clearly visible, well-lit, and not a random photo.";
      Alert.alert("Invalid Document Image", errMsg);
    } finally {
      setOcrLoading(false);
    }
  };

  const handleRemoveDoc = (side: "FRONT" | "BACK") => {
    if (side === "FRONT") {
      setFrontDoc(null);
    } else {
      setBackDoc(null);
    }
    if (isOcrExtracted) {
      setIsOcrExtracted(false);
      setDlNumber("");
      setDob("");
      setExtractedName(null);
    }
  };

  const openPicker = (side: "FRONT" | "BACK") => {
    setActiveSide(side);
    setPickerModalVisible(true);
  };

  const handleCameraCapture = async (side?: "FRONT" | "BACK") => {
    const targetSide = side || activeSide;
    setActiveSide(targetSide);
    const doc = await documentCapture.captureWithCamera();
    if (doc) {
      await processDocumentOcr(doc, targetSide);
    }
  };

  const handleGalleryBrowse = async (side?: "FRONT" | "BACK") => {
    const targetSide = side || activeSide;
    setActiveSide(targetSide);
    const doc = await documentCapture.browsePhotoGallery();
    if (doc) {
      await processDocumentOcr(doc, targetSide);
    }
  };

  const handleFileBrowse = async (side?: "FRONT" | "BACK") => {
    const targetSide = side || activeSide;
    setActiveSide(targetSide);
    const doc = await documentCapture.browsePhoneDocuments();
    if (doc) {
      await processDocumentOcr(doc, targetSide);
    }
  };

  return {
    dlNumber,
    setDlNumber,
    dob,
    setDob,
    frontDoc,
    setFrontDoc,
    backDoc,
    setBackDoc,
    activeSide,
    isOcrExtracted,
    setIsOcrExtracted,
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
  };
}

export default useDrivingLicense;
