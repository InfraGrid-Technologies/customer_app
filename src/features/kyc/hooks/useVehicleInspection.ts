/**
 * KYC Feature Slice Hook: useVehicleInspection
 *
 * Headless business logic for Vehicle RC Roadworthiness & E-Challan Traffic Fines check.
 * Manages mandatory front/back RC document attachments, AI OCR extraction, and VAHAN/Sarathi validation.
 */

import { useState } from "react";
import { Alert } from "react-native";
import { kycApi } from "../services/kycApi";
import { documentCapture, type CapturedDocument } from "../../../utils";
import { validators } from "../../../utils/validators";
import { VEHICLE_CATEGORIES, type VehicleCategoryItem, type VehicleTypeItem, findRtoClassForType, findCategoryForType } from "../constants/vehicleTaxonomy";

export { VEHICLE_CATEGORIES, type VehicleCategoryItem, type VehicleTypeItem, findRtoClassForType, findCategoryForType };

export function useVehicleInspection() {
  const [vehicleCategory, setVehicleCategory] = useState<string>("");
  const [vehicleType, setVehicleType] = useState<string>("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [engineNumber, setEngineNumber] = useState("");
  const [chassisNumber, setChassisNumber] = useState("");
  const [frontDoc, setFrontDoc] = useState<CapturedDocument | null>(null);
  const [backDoc, setBackDoc] = useState<CapturedDocument | null>(null);
  const [activeSide, setActiveSide] = useState<"FRONT" | "BACK">("FRONT");
  const [isOcrExtracted, setIsOcrExtracted] = useState<boolean>(false);
  const [extractedMeta, setExtractedMeta] = useState<{
    makerModel?: string;
    ownerName?: string;
    fuelType?: string;
  } | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pickerModalVisible, setPickerModalVisible] = useState(false);

  const cleanVehicleNumber = vehicleNumber.replace(/[\s-]/g, "").toUpperCase();

  const isVehicleValid = validators.isValidVehicleNumber(cleanVehicleNumber);
  const isEngineValid = Boolean(engineNumber.trim().length >= 5);
  const isChassisValid = validators.isValidChassisNumber(chassisNumber);

  const isFormValid = Boolean(
    frontDoc &&
    backDoc &&
    vehicleType.trim().length >= 2 &&
    isVehicleValid &&
    isEngineValid &&
    isChassisValid &&
    agreed &&
    !loading
  );

  const handleInspect = async (forceRefresh = true) => {
    setErrorMsg(null);

    if (!frontDoc || !backDoc) {
      setErrorMsg("Both Front and Back photos of the vehicle RC card are mandatory.");
      Alert.alert("Documents Required", "Please upload clear photos of both Front and Back sides of the RC card.");
      return;
    }

    if (!vehicleType.trim()) {
      setErrorMsg("Please enter the vehicle type or upload the back side of your RC card.");
      Alert.alert("Vehicle Type Required", "Please enter the vehicle type or upload the back side of your RC card.");
      return;
    }
    const effectiveCategory = vehicleCategory || findCategoryForType(vehicleType) || "CEV";
    if (!validators.isValidVehicleNumber(cleanVehicleNumber)) {
      const message =
        "Invalid Vehicle Registration Number format (e.g. MH12AB1234 or TS16FD7966).";
      setErrorMsg(message);
      Alert.alert("Invalid Vehicle Number", message);
      return; // ⛔ BLOCKED LOCALLY! ₹0 spent.
    }
    if (!isEngineValid) {
      const message = "Engine Number is mandatory (minimum 5 alphanumeric characters).";
      setErrorMsg(message);
      Alert.alert("Invalid Engine Number", message);
      return;
    }
    if (!validators.isValidChassisNumber(chassisNumber)) {
      const message =
        "Chassis Number (VIN) must be exactly 17 characters (excluding letters I, O, Q).";
      setErrorMsg(message);
      Alert.alert("Invalid Chassis Number", message);
      return; // ⛔ BLOCKED LOCALLY!
    }
    if (!agreed) {
      Alert.alert(
        "Consent Required",
        "Please confirm consent to verify vehicle RC and check traffic challans.",
      );
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await kycApi.inspectVehicle({
        vehicleNumber: cleanVehicleNumber,
        vehicleCategory: effectiveCategory,
        vehicleType: vehicleType.trim(),
        engineNumber: engineNumber.trim(),
        chassisNumber: chassisNumber.trim(),
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
        checkChallan: true,
        consent: {
          agreed: true,
          noticeVersion: "INSPECTION_NOTICE_V1.0",
          noticeText:
            "I hereby give free consent to verify vehicle RC records and check pending traffic challans via the National Register (VAHAN/Sarathi).",
        },
        forceRefresh,
      });

      setResult(response);
    } catch (err: any) {
      Alert.alert(
        "Vehicle Verification Failed",
        err.message || "Could not verify vehicle.",
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Processes captured/browsed RC document:
   * - Auto-fill fields ONLY after uploading BOTH front and back images.
   * - When both sides are uploaded, the front side is analyzed by Surepass AI OCR
   *   to extract vehicle number, chassis number, and engine number.
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
      const ocrRes = await kycApi.ocrVehicleRc({
        imageBase64: updatedFront.base64,
        mimeType: updatedFront.mimeType || "image/jpeg",
        consent: {
          agreed: true,
          noticeVersion: "RC_OCR_V1.0",
          noticeText: "User consent for Vehicle RC OCR extraction",
        },
      });

      if (ocrRes.success && ocrRes.data) {
        setIsOcrExtracted(true);
        if (ocrRes.data.vehicleNumber)
          setVehicleNumber(ocrRes.data.vehicleNumber);
        if (ocrRes.data.engineNumber)
          setEngineNumber(ocrRes.data.engineNumber);
        if (ocrRes.data.chassisNumber)
          setChassisNumber(ocrRes.data.chassisNumber);

        setExtractedMeta((prev) => ({
          ...prev,
          makerModel: ocrRes.data.makerModel || prev?.makerModel,
          ownerName: ocrRes.data.ownerName || prev?.ownerName,
          fuelType: ocrRes.data.fuelType || prev?.fuelType,
          vehicleClass: ocrRes.data.vehicleClass,
        }));
      } else {
        setIsOcrExtracted(false);
        Alert.alert(
          "Invalid Document Image",
          ocrRes.data?.message || ocrRes.message || "The uploaded image does not appear to be an official Vehicle Registration Certificate (RC). Please upload a clear photo of your physical card."
        );
      }
    } catch (err: any) {
      setIsOcrExtracted(false);
      const errMsg = err?.message || "Invalid Document Image: The uploaded photo does not appear to be a valid Vehicle Registration Certificate (RC). Please ensure the physical card is well-lit, fully visible, and not a random photo.";
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
      setVehicleNumber("");
      setEngineNumber("");
      setChassisNumber("");
      setExtractedMeta(null);
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
    vehicleCategory,
    setVehicleCategory,
    showCategoryDropdown,
    setShowCategoryDropdown,
    vehicleType,
    setVehicleType,
    showTypeDropdown,
    setShowTypeDropdown,
    isFormValid,
    vehicleNumber,
    setVehicleNumber,
    engineNumber,
    setEngineNumber,
    chassisNumber,
    setChassisNumber,
    frontDoc,
    setFrontDoc,
    backDoc,
    setBackDoc,
    activeSide,
    isOcrExtracted,
    setIsOcrExtracted,
    extractedMeta,
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
    handleInspect,
    handleCameraCapture,
    handleGalleryBrowse,
    handleFileBrowse,
  };
}

export default useVehicleInspection;
