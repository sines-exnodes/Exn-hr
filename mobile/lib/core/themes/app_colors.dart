import 'package:flutter/material.dart';

/// Design tokens from Pencil Design System (pencil-new.pen)
/// Supports 2 themes: Green (default) + Dark Blue
class AppColors {
  const AppColors._();

  // ===== GREEN THEME (Default) =====
  static const Color primary = Color(0xFF22C55E);
  static const Color primaryLight = Color(0xFFDCFCE7);
  static const Color primaryDark = Color(0xFF16A34A);

  static const Color bgPage = Color(0xFFF9FAFB);
  static const Color bgSurface = Color(0xFFF5F5F5);
  static const Color bgCard = Color(0xFFFFFFFF);
  static const Color bgInput = Color(0xFFFFFFFF);

  static const Color textPrimary = Color(0xFF0D0D0D);
  static const Color textSecondary = Color(0xFF7A7A7A);
  static const Color textMuted = Color(0xFFB0B0B0);

  static const Color success = Color(0xFF22C55E);
  static const Color successBg = Color(0xFFECFDF5);
  static const Color warning = Color(0xFFF59E0B);
  static const Color warningBg = Color(0xFFFEF3C7);
  static const Color error = Color(0xFFEF4444);
  static const Color errorBg = Color(0xFFFEE2E2);
  static const Color info = Color(0xFF3B82F6);
  static const Color infoBg = Color(0xFFEFF6FF);

  static const Color border = Color(0xFFE8E8E8);
  static const Color divider = Color(0xFFF3F4F6);

  static const Color tabActiveBg = Color(0xFF22C55E);
  static const Color navInactive = Color(0xFF9CA3AF);

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

  // ===== LEGACY ALIASES (for backward compatibility with existing UI) =====
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
