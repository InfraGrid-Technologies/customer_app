/**
 * Enterprise KYC Domain Types & Data Contracts
 * Enforces strict typing across all KYC verification screens, components, and API services.
 */

// the 5 allowable states
export type ComplianceVerdict = 'VERIFIED' | 'FAILED' | 'PENDING' | 'BLACKLISTED' | 'EXPIRED';

// types of the consent
export type ConsentPayload = boolean | {
  agreed: boolean;
  noticeVersion?: string;
  noticeText?: string;
  [key: string]: any;
};

// types of the image we will save on DB on user upload(RC & DL).
export interface DocumentAttachment {
  fileBase64: string;
  originalFilename?: string;
  mimeType?: string;
}


// 1. Driving License Models
export interface DrivingLicenseRequest {
  dlNumber: string;
  dob: string;
  // currently docments are also nullable so that even text typing also valid we can make then not nullable to ensure mandatory phto in DB.
  frontDocument?: DocumentAttachment | null;
  backDocument?: DocumentAttachment | null;
  consent: ConsentPayload;
  forceRefresh?: boolean;
}

export interface DrivingLicenseResult {
  dlNumber: string;
  name?: string;
  dob?: string;
  validUntil?: string;
  covDetails?: {
    cov?: string;
    issueDate?: string;
  }[];
  transportValidUntil?: string;
  status: ComplianceVerdict;
  raw?: unknown;
}

// 2. Vehicle RC Models
export interface VehicleRcRequest {
  vehicleNumber: string;
  vehicleCategory?: string;
  vehicleType?: string;
  frontDocument?: DocumentAttachment | null;
  backDocument?: DocumentAttachment | null;
  consent: ConsentPayload;
  forceRefresh?: boolean;
}

export interface VehicleInspectionRequest {
  // combined RC,challan
  vehicleNumber: string;
  vehicleCategory?: string;
  vehicleType?: string;
  engineNumber?: string;
  chassisNumber?: string;
  frontDocument?: DocumentAttachment | null;
  backDocument?: DocumentAttachment | null;
  checkChallan?: boolean;
  statePortals?: string[];
  consent: ConsentPayload;
  forceRefresh?: boolean;
}

export interface ChallanItem {
  challanNumber: string;
  date?: string;
  amount: number;
  status: 'PENDING' | 'DISPOSED' | 'PAID';
  violation: string;
}

export interface VehicleInspectionResult {
  registrationNumber: string;
  ownerName?: string;
  vehicleClass?: string;
  fuelType?: string;
  fitnessValidUntil?: string;
  insuranceValidUntil?: string;
  puccValidUntil?: string;
  isBlacklisted?: boolean;
  challans?: ChallanItem[];
  totalChallanAmount?: number;
  verdict?: ComplianceVerdict;
  raw?: unknown;
}

// 3. Bank Account Models
export interface BankAccountRequest {
  accountNumber: string;
  ifsc: string;
  nameToMatch?: string;
  consent: ConsentPayload;
  forceRefresh?: boolean;
}

export interface BankAccountResult {
  accountNumber: string;
  ifsc: string;
  registeredName?: string;
  bankName?: string;
  branch?: string;
  nameMatchScore?: number;
  isPennyDropSuccess: boolean;
  status: ComplianceVerdict;
  raw?: unknown;
}

// 4. Aadhaar Models
export interface AadhaarInitiateRequest {
  redirectUrl?: string;
  logoUrl?: string;
  consent: ConsentPayload;
}

export interface AadhaarSessionResult {
  clientId: string;
  otpSent?: boolean;
  redirectUrl?: string;
  status: 'INITIATED' | 'COMPLETED' | 'EXPIRED';
}

// 5. DPDP Act 2023 Consent Models
export interface DPDPConsentArtifact {
  consentId: string;
  timestamp: string;
  purpose: string;
  status: 'ACTIVE' | 'REVOKED';
  dataFiduciary?: string;
  principalIdentifier?: string;
  retentionPeriodDays?: number;
}

// 6. Component Props
export interface DPDPConsentCardProps {
  agreed: boolean;
  onToggle: (val: boolean) => void;
  purpose?: string;
  disabled?: boolean;
  title?: string;
  noticeId?: string;
  onViewNotice?: () => void;
  onViewDataFlow?: () => void;
}

export interface VerifiedBadgeCardProps {
  status: ComplianceVerdict | string;
  title?: string;
  subtitle?: string;
  referenceNumber?: string;
  timestamp?: string;
  details?: { label: string; value: string | number; alert?: boolean }[];
}
