import 'package:flutter/material.dart';

/// Design tokens — 2025 refreshed palette
/// Supports 2 themes: Green (default) + Dark Blue
class AppColors {
  const AppColors._();

  // ===== GREEN THEME (Default) =====
  static const Color primary = Color(0xFF16A34A);
  static const Color primaryLight = Color(0xFFDCFCE7);
  static const Color primaryDark = Color(0xFF15803D);
  static const Color primarySoft = Color(0xFFBBF7D0);

  static const Color bgPage = Color(0xFFF8FAFC);
  static const Color bgSurface = Color(0xFFF1F5F9);
  static const Color bgCard = Color(0xFFFFFFFF);
  static const Color bgInput = Color(0xFFFFFFFF);

  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color textMuted = Color(0xFF94A3B8);

  static const Color success = Color(0xFF16A34A);
  static const Color successBg = Color(0xFFDCFCE7);
  static const Color warning = Color(0xFFF59E0B);
  static const Color warningBg = Color(0xFFFEF3C7);
  static const Color error = Color(0xFFDC2626);
  static const Color errorBg = Color(0xFFFEE2E2);
  static const Color info = Color(0xFF2563EB);
  static const Color infoBg = Color(0xFFDBEAFE);

  static const Color border = Color(0xFFE2E8F0);
  static const Color divider = Color(0xFFF1F5F9);

  static const Color tabActiveBg = Color(0xFF16A34A);
  static const Color navInactive = Color(0xFF94A3B8);

  // ===== GRADIENT PALETTE =====
  static const Color gradientStart = Color(0xFF16A34A);
  static const Color gradientEnd = Color(0xFF059669);
  static const Color gradientAccent = Color(0xFF10B981);

  // Quick action accent colors
  static const Color accentPurple = Color(0xFF7C3AED);
  static const Color accentPurpleBg = Color(0xFFF3E8FF);
  static const Color accentAmber = Color(0xFFD97706);
  static const Color accentAmberBg = Color(0xFFFEF3C7);
  static const Color accentBlue = Color(0xFF2563EB);
  static const Color accentBlueBg = Color(0xFFDBEAFE);
  static const Color accentTeal = Color(0xFF0D9488);
  static const Color accentTealBg = Color(0xFFCCFBF1);

  // Glassmorphism
  static const Color glassWhite = Color(0x33FFFFFF);
  static const Color glassBorder = Color(0x22FFFFFF);

  // ===== DARK BLUE THEME =====
  static const Color darkPrimary = Color(0xFF2563EB);
  static const Color darkPrimaryLight = Color(0xFFDBEAFE);
  static const Color darkPrimaryDark = Color(0xFF1D4ED8);

  static const Color darkBgPage = Color(0xFF0F172A);
  static const Color darkBgSurface = Color(0xFF1E293B);
  static const Color darkBgCard = Color(0xFF334155);
  static const Color darkBgInput = Color(0xFF1E293B);

  static const Color darkTextPrimary = Color(0xFFF1F5F9);
  static const Color darkTextSecondary = Color(0xFF94A3B8);
  static const Color darkTextMuted = Color(0xFF64748B);

  static const Color darkSuccessBg = Color(0xFF052E16);
  static const Color darkWarningBg = Color(0xFF451A03);
  static const Color darkErrorBg = Color(0xFF450A0A);
  static const Color darkInfoBg = Color(0xFF172554);

  static const Color darkBorder = Color(0xFF334155);
  static const Color darkTabActiveBg = Color(0xFF2563EB);

  // ===== LEGACY ALIASES =====
  static const Color background = bgSurface;
  static const Color surface = bgCard;
  static const Color cardBackground = bgCard;
  static const Color textWhite = Color(0xFFFFFFFF);
  static const Color textHint = textMuted;
  static const Color navActive = primary;
  static const Color pending = warning;
  static const Color approved = success;
  static const Color rejected = error;
  static const Color checkInGreen = primary;
  static const Color checkOutOrange = warning;
}
