/**
 * Design Tokens — extracted from Pencil Design System (pencil-new.pen)
 * 2 themes: green (default) + dark-blue
 *
 * Typography: Space Grotesk (headings) + Inter (body)
 * Icons: Lucide React
 */

export const themes = {
  green: {
    // Core
    primary: '#22C55E',
    'primary-light': '#DCFCE7',
    'primary-dark': '#16A34A',

    // Backgrounds
    'bg-page': '#F9FAFB',
    'bg-surface': '#F5F5F5',
    'bg-card': '#FFFFFF',
    'bg-input': '#FFFFFF',
    'bg-sidebar': '#1E293B',

    // Text
    'text-primary': '#0D0D0D',
    'text-secondary': '#7A7A7A',
    'text-muted': '#B0B0B0',

    // Sidebar
    'sidebar-text': '#94A3B8',
    'sidebar-active-bg': '#22C55E',
    'sidebar-active-text': '#FFFFFF',

    // Status
    success: '#22C55E',
    'success-bg': '#ECFDF5',
    warning: '#F59E0B',
    'warning-bg': '#FEF3C7',
    danger: '#EF4444',
    'danger-bg': '#FEE2E2',
    info: '#3B82F6',
    'info-bg': '#EFF6FF',

    // Border
    border: '#E8E8E8',

    // Tab
    'tab-active-bg': '#22C55E',
    white: '#FFFFFF',
  },

  'dark-blue': {
    // Core
    primary: '#2563EB',
    'primary-light': '#DBEAFE',
    'primary-dark': '#1D4ED8',

    // Backgrounds
    'bg-page': '#0F172A',
    'bg-surface': '#1E293B',
    'bg-card': '#334155',
    'bg-input': '#1E293B',
    'bg-sidebar': '#0F172A',

    // Text
    'text-primary': '#F1F5F9',
    'text-secondary': '#94A3B8',
    'text-muted': '#64748B',

    // Sidebar
    'sidebar-text': '#64748B',
    'sidebar-active-bg': '#2563EB',
    'sidebar-active-text': '#FFFFFF',

    // Status
    success: '#22C55E',
    'success-bg': '#052E16',
    warning: '#F59E0B',
    'warning-bg': '#451A03',
    danger: '#EF4444',
    'danger-bg': '#450A0A',
    info: '#3B82F6',
    'info-bg': '#172554',

    // Border
    border: '#334155',

    // Tab
    'tab-active-bg': '#2563EB',
    white: '#FFFFFF',
  },
} as const;

export type ThemeName = keyof typeof themes;
export type ThemeTokens = Record<string, string>;

// CSS variable names (use in Tailwind via var(--token-name))
export function themeToCSS(theme: ThemeTokens): Record<string, string> {
  return Object.entries(theme).reduce(
    (acc, [key, value]) => {
      acc[`--${key}`] = value;
      return acc;
    },
    {} as Record<string, string>,
  );
}

// Typography
export const typography = {
  fontHeading: "'Space Grotesk', sans-serif",
  fontBody: "'Inter', sans-serif",
  sizes: {
    'page-title': { size: '28px', weight: '500', letterSpacing: '-1px', font: 'heading' },
    'section-title': { size: '18px', weight: '600', font: 'heading' },
    'card-title': { size: '16px', weight: '600', font: 'heading' },
    'body': { size: '14px', weight: '400', font: 'body' },
    'body-medium': { size: '14px', weight: '500', font: 'body' },
    'label': { size: '13px', weight: '500', font: 'body' },
    'small': { size: '12px', weight: '500', font: 'body' },
    'caption': { size: '11px', weight: '600', font: 'body' },
    'metric': { size: '36px', weight: '600', letterSpacing: '-1px', font: 'heading' },
  },
} as const;

// Spacing (consistent with Pencil design)
export const spacing = {
  'page-padding': '32px 40px',
  'card-padding': '24px',
  'section-gap': '24px',
  'card-gap': '20px',
  'input-height': '42px',
  'button-height': '44px',
  'sidebar-width': '240px',
  'header-height': '64px',
  'corner-radius': '12px',
  'corner-radius-sm': '8px',
} as const;

// Lucide icon mapping for sidebar (matching Pencil design)
export const sidebarIcons = {
  dashboard: 'LayoutDashboard',
  organization: 'Building2',
  employees: 'Users',
  attendance: 'ScanLine',
  leave: 'Calendar',
  overtime: 'Timer',
  payroll: 'Wallet',
  reports: 'BarChart3',
} as const;
