// Strict Type Scale Lock - Enterprise Typography Engine
// Enforces consistent hierarchy and line-heights across all screens.

export const typography = {
  // Display H1: Locked across all screen titles (text-4xl, font-semibold, tracking-tight)
  displayH1: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '600' as const,
    letterSpacing: -1,
  },
  h2: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '600' as const,
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
    letterSpacing: -0.25,
  },
  h4: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600' as const,
  },
  sectionTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700' as const,
    letterSpacing: 0.2,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
  },
  bodyBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600' as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
  },
  micro: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700' as const,
    letterSpacing: 0.4,
  },
  mono: {
    fontFamily: 'monospace',
  },
} as const;

export type ThemeTypography = typeof typography;

