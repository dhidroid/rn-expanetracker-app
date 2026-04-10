export type ThemeColors = typeof colors;

export const colors = {
  // Brand accent — vibrant violet/purple
  primary: '#7C3AED',
  primaryLight: '#9D66F5',
  primaryDark: '#5B21B6',

  // Surfaces — very dark near-black
  background: '#0D0D0F',
  surface: '#161618',
  surfaceVariant: '#1E1E22',
  surfaceActive: '#252529',

  // Text
  text: '#F5F5F7',
  textSecondary: '#8E8E97',
  textMuted: '#52525A',

  // Utility
  border: '#2A2A2E',
  error: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
  white: '#FFFFFF',
  black: '#000000',

  // Semantic
  income: '#22C55E',
  expense: '#EF4444',

  // Glass / overlay
  glass: 'rgba(255, 255, 255, 0.04)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassShadow: 'rgba(0, 0, 0, 0.5)',
  overlay: 'rgba(0, 0, 0, 0.75)',

  // Gradient stops used in LinearGradient
  gradientCard1: '#2D1B69',
  gradientCard2: '#7C3AED',
  gradientCard3: '#0D0D0F',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Flat / minimal — almost no rounding
export const borderRadius = {
  none: 0,
  sm: 2,
  md: 4,
  lg: 6,
  xl: 8,
  xxl: 10,
  full: 9999,
};

export const glassShadow = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const typography = {
  h1: { fontSize: 40, fontWeight: '700' as const, letterSpacing: -1 },
  h2: { fontSize: 30, fontWeight: '700' as const, letterSpacing: -0.5 },
  h3: { fontSize: 22, fontWeight: '600' as const },
  h4: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  bodyMedium: { fontSize: 16, fontWeight: '500' as const },
  bodySmall: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '500' as const, letterSpacing: 0.3 },
  label: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.8, textTransform: 'uppercase' as const },
};
