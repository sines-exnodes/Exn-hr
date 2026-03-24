/**
 * Design Tokens — synced from Pencil Design System (pencil-new.pen)
 * 2 themes: green (default) + dark-blue
 *
 * Typography: Space Grotesk (headings) + Inter (body)
 * Icons: Lucide React
 */

export const themes = {
  green: {
    // Core
    primary: '#16A34A',
    'primary-light': '#DCFCE7',
    'primary-hover': '#15803D',

    // Backgrounds
    'bg-page': '#FFFFFF',
    'bg-surface': '#F8FAF8',
    'bg-card': '#FFFFFF',
    'bg-input': '#FFFFFF',
    'bg-sidebar': '#1E293B',

    // Text
    'text-primary': '#111827',
    'text-secondary': '#6B7280',
    'text-muted': '#9CA3AF',
    'text-on-primary': '#FFFFFF',

    // Sidebar
    'sidebar-text': '#94A3B8',
    'sidebar-active-bg': '#16A34A',
    'sidebar-active-text': '#FFFFFF',

    // Status
    success: '#22C55E',
    'success-bg': '#DCFCE7',
    warning: '#F59E0B',
    'warning-bg': '#FEF3C7',
    danger: '#EF4444',
    'danger-bg': '#FEE2E2',
    info: '#3B82F6',
    'info-bg': '#DBEAFE',

    // Border
    border: '#E5E7EB',
    'border-focus': '#16A34A',

    // Tab
    'tab-active-bg': '#16A34A',
    white: '#FFFFFF',
  },

  'dark-blue': {
    // Core
    primary: '#1E3A5F',
    'primary-light': '#1A2F4A',
    'primary-hover': '#2A4A6F',

    // Backgrounds
    'bg-page': '#0A0A0A',
    'bg-surface': '#111111',
    'bg-card': '#1A1A1A',
    'bg-input': '#1A1A1A',
    'bg-sidebar': '#0D1B2A',

    // Text
    'text-primary': '#F1F5F9',
    'text-secondary': '#94A3B8',
    'text-muted': '#64748B',
    'text-on-primary': '#FFFFFF',

    // Sidebar
    'sidebar-text': '#94A3B8',
    'sidebar-active-bg': '#1E3A5F',
    'sidebar-active-text': '#FFFFFF',

    // Status
    success: '#22C55E',
    'success-bg': '#052E16',
    warning: '#F59E0B',
    'warning-bg': '#422006',
    danger: '#EF4444',
    'danger-bg': '#450A0A',
    info: '#60A5FA',
    'info-bg': '#172554',

    // Border
    border: '#2A2A2A',
    'border-focus': '#3B82F6',

    // Tab
    'tab-active-bg': '#1E3A5F',
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
