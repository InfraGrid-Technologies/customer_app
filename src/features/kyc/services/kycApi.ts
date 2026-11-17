import { apiClient } from '../../../core/network/apiClient';
import type {
  DrivingLicenseRequest,
  VehicleRcRequest,
  VehicleInspectionRequest,
  BankAccountRequest,
  AadhaarInitiateRequest,
  ConsentPayload,
} from '../types';

/**
 * KYC & Identity Verification API Service
 * Encapsulates all backend endpoints for Driving License, Vehicle RC, Bank Account, Aadhaar, and DPDP Consent.
 */
export const kycApi = {
  // 1. Driving License Verification
  async verifyDrivingLicense({ dlNumber, dob, frontDocument, backDocument, consent, forceRefresh = false }: DrivingLicenseRequest): Promise<any> {
    const payload: any = { dlNumber, dob, consent, forceRefresh };
    if (frontDocument) payload.frontDocument = frontDocument;
    if (backDocument) payload.backDocument = backDocument;
    return apiClient<any>('/v1/kyc/driving-license', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // 2. Vehicle RC Verification
  async verifyVehicleRc({ vehicleNumber, vehicleCategory, vehicleType, frontDocument, backDocument, consent, forceRefresh = false }: VehicleRcRequest): Promise<any> {
    const payload: any = { vehicleNumber, consent, forceRefresh };
    if (vehicleCategory) payload.vehicleCategory = vehicleCategory;
    if (vehicleType) payload.vehicleType = vehicleType;
    if (frontDocument) payload.frontDocument = frontDocument;
    if (backDocument) payload.backDocument = backDocument;
    return apiClient<any>('/v1/kyc/rc', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // 2b. Unified Vehicle & Equipment Inspection (RC Roadworthiness + E-Challan Fines in One Shot)
  async inspectVehicle({
    vehicleNumber,
    vehicleCategory,
    vehicleType,
    engineNumber,
    chassisNumber,
    frontDocument,
    backDocument,
    checkChallan = true,
    statePortals,
    consent,
    forceRefresh = false,
  }: VehicleInspectionRequest): Promise<any> {
    try {
      const payload: any = {
        vehicleNumber,
        checkChallan,
        consent,
        forceRefresh,
      };
      if (vehicleCategory) payload.vehicleCategory = vehicleCategory;
      if (vehicleType) payload.vehicleType = vehicleType;
      if (engineNumber) payload.engineNumber = engineNumber;
      if (chassisNumber) payload.chassisNumber = chassisNumber;
      if (frontDocument) payload.frontDocument = frontDocument;
      if (backDocument) payload.backDocument = backDocument;
      if (statePortals) payload.statePortals = statePortals;

      return await apiClient<any>('/v1/kyc/vehicle-inspection', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err: any) {
      // Fallback: If unified endpoint returns 404, execute RC and Challan concurrently
      if (err?.status === 404 || err?.message?.includes('404')) {
        const rcRes = await kycApi.verifyVehicleRc({ vehicleNumber, consent, forceRefresh });
        let challanRes = null;
        if (checkChallan) {
          try {
            challanRes = await kycApi.verifyChallan({
              rcNumber: vehicleNumber,
              chassisNumber: chassisNumber || rcRes?.data?.chassisNumber,
              engineNumber: engineNumber || rcRes?.data?.engineNumber,
              consent,
              forceRefresh,
            });
          } catch {
            // Optional challan failure tolerated in fallback
          }
        }
        const isVerified = Boolean(rcRes.isVerified && (!challanRes || challanRes.isVerified));
        return {
          success: true,
          isVerified,
          verificationStatus: isVerified ? 'VERIFIED' : 'REJECTED',
          rejectionReasons: [
            ...(rcRes.rejectionReasons || []),
            ...(challanRes?.rejectionReasons || []),
          ],
          source: 'SUREPASS',
          provider: 'surepass',
          consentId: rcRes.consentId,
          challanConsentId: challanRes?.consentId,
          data: {
            isUnified: true,
            vehicleNumber: rcRes.data?.vehicleNumber || vehicleNumber,
            makerModel: rcRes.data?.makerModel,
            vehicleClass: rcRes.data?.vehicleClass,
            chassisNumber: rcRes.data?.chassisNumber,
            engineNumber: rcRes.data?.engineNumber,
            status: rcRes.data?.status,
            compliance: rcRes.data?.compliance,
            rcCompliance: rcRes.data?.compliance,
            challanCompliance: challanRes?.data?.compliance,
            challans: challanRes?.data?.challans || [],
            pendingChallansCount: challanRes?.data?.pendingChallansCount || 0,
            totalPendingAmount: challanRes?.data?.totalPendingAmount || 0,
            rawRc: rcRes.data,
            rawChallan: challanRes?.data,
          },
        };
      }
      throw err;
    }
  },

  // 3. Bank Account Penny Drop
  async verifyBankAccount({
    accountNumber,
    ifsc,
    nameToMatch,
    consent,
    forceRefresh = false,
  }: BankAccountRequest): Promise<any> {
    return apiClient<any>('/v1/kyc/bank-account', {
      method: 'POST',
      body: JSON.stringify({ accountNumber, ifsc, nameToMatch: nameToMatch || undefined, consent, forceRefresh }),
    });
  },

  // 4. Vehicle E-Challan
  async verifyChallan({
    rcNumber,
    vehicleCategory,
    vehicleType,
    chassisNumber,
    engineNumber,
    consent,
    forceRefresh = false,
  }: {
    rcNumber: string;
    vehicleCategory?: string;
    vehicleType?: string;
    chassisNumber?: string;
    engineNumber?: string;
    consent: ConsentPayload;
    forceRefresh?: boolean;
  }): Promise<any> {
    return apiClient<any>('/v1/kyc/challan', {
      method: 'POST',
      body: JSON.stringify({ rcNumber, vehicleCategory, vehicleType, chassisNumber, engineNumber, consent, forceRefresh }),
    });
  },

  // 5. DigiLocker Aadhaar Session Initiation
  async initiateAadhaar({ redirectUrl, logoUrl, consent }: AadhaarInitiateRequest): Promise<any> {
    return apiClient<any>('/v1/kyc/aadhaar/initiate', {
      method: 'POST',
      body: JSON.stringify({ redirectUrl, logoUrl, consent }),
    });
  },

  // 5b. Fetch DigiLocker Verified Aadhaar Details
  async getAadhaarDetails(clientId: string): Promise<any> {
    return apiClient<any>(`/v1/kyc/aadhaar/${clientId}`);
  },

  // 6. Get Immutable DPDP Consent Artifact (₹0 cost)
  async getConsent(consentId: string): Promise<any> {
    return apiClient<any>(`/v1/kyc/consents/${consentId}`);
  },

  // 7. Revoke User Consent under DPDP Act 2023 Sec 6(4) (₹0 cost)
  async revokeConsent(consentId: string): Promise<any> {
    return apiClient<any>(`/v1/kyc/consents/${consentId}/revoke`, {
      method: 'POST',
    });
  },

  // 8. Get Verification Audit History (₹0 cost)
  async getHistory(type: string, idNumber: string): Promise<any> {
    return apiClient<any>(`/v1/kyc/history/${type}/${idNumber}`);
  },

  // 9. Document OCR Extraction (Photo of DL or RC)
  async ocrVehicleRc({
    imageBase64,
    fileUrl,
    mimeType = 'image/jpeg',
    consent,
  }: {
    imageBase64?: string;
    fileUrl?: string;
    mimeType?: string;
    consent?: ConsentPayload | boolean;
  }): Promise<any> {
    const consentPayload: ConsentPayload =
      typeof consent === 'object' && consent !== null
        ? consent
        : {
            agreed: true,
            noticeVersion: 'RC_OCR_V1.0',
            noticeText: 'User consent for Vehicle RC OCR extraction under DPDP Act 2023',
          };
    return apiClient<any>('/v1/kyc/ocr/rc', {
      method: 'POST',
      body: JSON.stringify({ imageBase64, fileUrl, mimeType, consent: consentPayload }),
    });
  },

  async ocrDrivingLicense({
    imageBase64,
    fileUrl,
    mimeType = 'image/jpeg',
    consent,
  }: {
    imageBase64?: string;
    fileUrl?: string;
    mimeType?: string;
    consent?: ConsentPayload | boolean;
  }): Promise<any> {
    const consentPayload: ConsentPayload =
      typeof consent === 'object' && consent !== null
        ? consent
        : {
            agreed: true,
            noticeVersion: 'DL_OCR_V1.0',
            noticeText: 'User consent for Driving License OCR extraction under DPDP Act 2023',
          };
    return apiClient<any>('/v1/kyc/ocr/driving-license', {
      method: 'POST',
      body: JSON.stringify({ imageBase64, fileUrl, mimeType, consent: consentPayload }),
    });
  },

  async extractDocumentOcr({
    imageBase64,
    fileUrl,
    documentType,
    mimeType = 'image/jpeg',
    consent = true,
  }: {
    imageBase64?: string;
    fileUrl?: string;
    documentType: 'RC' | 'DL' | 'vehicle-rc' | 'driving-license' | string;
    mimeType?: string;
    consent?: ConsentPayload | boolean;
  }): Promise<any> {
    const typeStr = (documentType || '').toLowerCase();
    const isRc = typeStr.includes('rc') || typeStr.includes('vehicle');
    if (isRc) {
      return this.ocrVehicleRc({ imageBase64, fileUrl, mimeType, consent });
    }
    return this.ocrDrivingLicense({ imageBase64, fileUrl, mimeType, consent });
  },

  // 10. Fetch RC Vehicle Categories & Statutory COV Codes (DB Sourced)
  async getVehicleCategories(): Promise<any> {
    return apiClient<any>('/v1/kyc/vehicle-categories', {
      method: 'GET',
    });
  },

  // 11. Server Health Ping
  async checkHealth(): Promise<any> {
    return apiClient<any>('/health');
  },
};

export default kycApi;
