/**
 * KYC Feature Module - Public API Barrel
 *
 * ARCHITECTURAL ROLE:
 * This is the sole public doorway for the KYC business domain.
 * Any screen, navigator, or external feature importing KYC functionality imports from here.
 *
 * EXPOSES:
 * 1. Screens: Ready-to-mount UI screens for DL, Vehicle Inspection, Aadhaar, Bank, and Audit.
 * 2. Headless Hooks: Reusable business logic hooks (useDrivingLicense, useVehicleInspection, etc.).
 * 3. Feature Components: DPDPConsentCard, VerifiedBadgeCard.
 * 4. API Services: kycApi client calls.
 * 5. Domain Models: TypeScript interfaces.
 */

// 1. Standalone Drop-in Navigator
export { KycNavigator } from './navigation/KycNavigator';
export type { KycNavigatorProps } from './navigation/KycNavigator';

// 2. Mobile Screens
export { DrivingLicenseScreen } from './screens/DrivingLicenseScreen';
export { VehicleInspectionScreen } from './screens/VehicleInspectionScreen';
export { AadhaarScreen } from './screens/AadhaarScreen';
export { BankAccountScreen } from './screens/BankAccountScreen';
export { ConsentAuditScreen } from './screens/ConsentAuditScreen';
export { ChallanScreen } from './screens/ChallanScreen';

// 3. Headless Business Logic Hooks
export {
  useDrivingLicense,
  useVehicleInspection,
  useAadhaar,
  useBankAccount,
  useConsentAudit,
  useKeyboardOffset,
} from './hooks';

// 4. Reusable Feature UI Components
export { DPDPConsentCard, VerifiedBadgeCard } from './components';

// 5. API Client & Services
export { kycApi } from './services/kycApi';

// 6. Domain Types & Contracts
export * from './types';
