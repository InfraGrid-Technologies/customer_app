# EquipRent Mobile Frontend

Enterprise React Native / Expo application for EquipRent equipment operators, fleet managers, and rental operations.

## Architecture: Feature-Sliced Architecture (FSA)

```text
src/
├── core/                        # Global Foundation
│   ├── theme/                   # Centralized Theme & Design System (tokens.js, typography.js)
│   └── network/                 # Resilient HTTP Client (apiClient.js, endpoints.js)
│
└── features/                    # Independent Domain Slices
    └── kyc/                     # Self-contained drop-in KYC verification module
        ├── components/          # DPDP Consent Card, Verified Badge Card
        ├── screens/             # License, Vehicle, Aadhaar, Bank, Audit screens
        ├── services/            # kycApi.js
        ├── navigation/          # KycNavigator.js
        └── index.js             # Public Barrel Export
```

## Running the App

```bash
# Start development server
npm start

# Open on Android Studio Emulator (press 'a' in terminal)
npm run android

# Open in Web Browser
npm run web
```

## Connecting to Backend API

- **Same Wi-Fi (Physical Phone):** `http://192.168.31.109:3100`
- **Android Studio Emulator:** `http://10.0.2.2:3100`
- **Production:** `https://api.equiprent.in`

