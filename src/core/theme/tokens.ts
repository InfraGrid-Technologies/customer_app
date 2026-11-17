// Centralized Design Tokens (Semantic Tailwind Color Palette, Radii, Shadows, Spacing)
// Modifying this single file instantly updates all screens and features across the mobile app.

export const tokens = {
  colors: {
    // Slate Neutrals (Backgrounds, Borders, Cards, Headers)
    slate50: '#f8fafc',
    slate100: '#f1f5f9',
    slate200: '#e2e8f0',
    slate300: '#cbd5e1',
    slate400: '#94a3b8',
    slate500: '#64748b',
    slate600: '#475569',
    slate700: '#334155',
    slate800: '#1e293b',
    slate900: '#0f172a',
    slate950: '#020617',

    // Primary Brand - EquipRent Construction Orange (from reference UI)
    primary: '#c2410c', // orange700 (solid action buttons)
    primaryLight: '#fff7ed', // orange50 (soft highlights)
    primaryBorder: '#fed7aa', // orange200
    primaryDark: '#9a3412', // orange800 (pressed state)
    orange50: '#fff7ed',
    orange100: '#ffedd5',
    orange200: '#fed7aa',
    orange500: '#f97316',
    orange600: '#ea580c',
    orange700: '#c2410c',
    orange800: '#9a3412',

    // Supporting Blue (for secondary badges)
    blue50: '#eff6ff',
    blue100: '#dbeafe',
    blue200: '#bfdbfe',
    blue500: '#3b82f6',
    blue600: '#2563eb',
    blue700: '#1d4ed8',

    // Semantic Success - Emerald (Government Verified, Roadworthy)
    success: '#059669',
    successLight: '#ecfdf5',
    successBorder: '#a7f3d0',
    successDark: '#047857',
    emerald50: '#ecfdf5',
    emerald100: '#d1fae5',
    emerald200: '#a7f3d0',
    emerald500: '#10b981',
    emerald600: '#059669',
    emerald700: '#047857',

    // Semantic Danger - Red (Unpaid Fines, Expired PUC/Fitness, Non-compliant)
    danger: '#dc2626',
    dangerLight: '#fef2f2',
    dangerBorder: '#fecaca',
    dangerDark: '#b91c1c',
    red50: '#fef2f2',
    red100: '#fee2e2',
    red200: '#fecaca',
    red500: '#ef4444',
    red600: '#dc2626',
    red700: '#b91c1c',

    // Semantic Warning - Amber (Pending Status, Advisory, LMV Only)
    warning: '#d97706',
    warningLight: '#fffbeb',
    warningBorder: '#fde68a',
    warningDark: '#b45309',
    amber50: '#fffbeb',
    amber100: '#fef3c7',
    amber200: '#fde68a',
    amber500: '#f59e0b',
    amber600: '#d97706',
    amber700: '#b45309',

    // Semantic Accent - Violet (DigiLocker, UIDAI Aadhaar)
    accent: '#7c3aed',
    accentLight: '#f5f3ff',
    accentBorder: '#ddd6fe',
    accentDark: '#6d28d9',
    violet50: '#f5f3ff',
    violet100: '#ede9fe',
    violet200: '#ddd6fe',
    violet300: '#c4b5fd',
    violet400: '#a78bfa',
    violet500: '#8b5cf6',
    violet600: '#7c3aed',
    violet700: '#6d28d9',

    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
  },

  radius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    pill: 9999,
  },

  shadows: {
    card: {
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 1,
    },
    elevated: {
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    primaryButton: {
      shadowColor: '#2563eb',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 3,
    },
  },
} as const;

export type ThemeTokens = typeof tokens;
export type ThemeColors = keyof typeof tokens.colors;
export type ThemeSpacing = keyof typeof tokens.spacing;
export type ThemeRadius = keyof typeof tokens.radius;
