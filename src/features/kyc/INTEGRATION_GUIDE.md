# EquipRent KYC Feature Module - Integration Guide

This directory (`src/features/kyc/`) is a **self-contained drop-in module** designed to be plugged directly into the main EquipRent React Native (Expo) mobile app.

---

## 1. Quick Integration (3 Steps)

### Step 1: Copy this folder
Copy `src/features/kyc/` directly into your main app's `src/features/` directory.

### Step 2: Ensure Expo Icons is installed
```bash
npx expo install @expo/vector-icons
```

### Step 3: Mount in Navigation
In your main app's navigator (e.g. `RootNavigator.js` or `AppNavigator.js`), import the `KycNavigator` from the barrel index:

```javascript
import { KycNavigator } from './src/features/kyc';

// Inside your Stack.Navigator:
<Stack.Screen 
  name="KYCVerification" 
  component={KycNavigator} 
  options={{ headerShown: false }} 
/>
```

---

## 2. Public Interface & Exports (`index.js`)

You should **only** import from `src/features/kyc/` directly (via its `index.js` barrel):

```javascript
import { 
  KycNavigator,             // Standalone 5-pillar tab navigator
  DrivingLicenseScreen,     // Individual screen if mounting custom tabs
  VehicleInspectionScreen,  // RC + Challan unified inspection screen
  AadhaarScreen,            // UIDAI DigiLocker Aadhaar e-KYC
  BankAccountScreen,        // Penny-drop bank verification
  ConsentAuditScreen,       // DPDP Act 2023 consent artifact review
  VerifiedBadgeCard,        // Green/Red compliance verdict badge card
  DPDPConsentCard,          // Legal DPDP Act consent switch
  kycApi,                   // Backend API client methods
} from './src/features/kyc';
```

---

## 3. Customizing the Theme & Branding

All KYC screens consume design tokens from `src/core/theme/tokens.js`.
If your main app has its own brand colors (e.g. Orange, Green, Teal), change the primary color in `src/core/theme/tokens.js`:

```javascript
export const tokens = {
  colors: {
    primary: '#YOUR_BRAND_COLOR', // Instantly updates all KYC action buttons
    // ...
  }
};
```

---

## 4. Backend API Endpoints

The KYC module communicates with the Fastify KYC backend engine via `src/core/network/apiClient.js`:
- **Development (Wi-Fi):** `http://<YOUR_PC_IP>:3100`
- **Android Studio Emulator:** `http://10.0.2.2:3100`
- **Production:** `https://api.equiprent.in`

To update the backend URL at runtime or from an app setting, call:
```javascript
import { setApiBaseUrl } from './src/core/network/apiClient';

setApiBaseUrl('https://api.equiprent.in');
```

