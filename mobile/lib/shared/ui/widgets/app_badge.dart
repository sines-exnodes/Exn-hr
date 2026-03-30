import 'package:exn_hr/core/themes/app_colors.dart';
import 'package:exn_hr/core/themes/app_text_styles.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

enum AppBadgeStatus { pending, approved, rejected, info }

class AppBadge extends StatelessWidget {
  const AppBadge({
    super.key,
    required this.label,
    required this.status,
  });

  final String label;
  final AppBadgeStatus status;

  Color get _backgroundColor {
    switch (status) {
      case AppBadgeStatus.pending:
        return AppColors.warningBg;
      case AppBadgeStatus.approved:
        return AppColors.successBg;
      case AppBadgeStatus.rejected:
        return AppColors.errorBg;
      case AppBadgeStatus.info:
        return AppColors.infoBg;
    }
  }

  Color get _dotColor {
    switch (status) {
      case AppBadgeStatus.pending:
        return AppColors.warning;
      case AppBadgeStatus.approved:
        return AppColors.success;
      case AppBadgeStatus.rejected:
        return AppColors.error;
      case AppBadgeStatus.info:
        return AppColors.info;
    }
  }

  Color get _textColor {
    switch (status) {
      case AppBadgeStatus.pending:
        return AppColors.accentAmber;
      case AppBadgeStatus.approved:
        return AppColors.primary;
      case AppBadgeStatus.rejected:
        return AppColors.error;
      case AppBadgeStatus.info:
        return AppColors.info;
    }
  }

  String get _displayLabel {
    switch (label.toLowerCase()) {
      case 'approved':
        return 'Đã duyệt';
      case 'rejected':
        return 'Từ chối';
      case 'pending':
        return 'Chờ duyệt';
      default:
        return label;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 5.w),
      decoration: BoxDecoration(
        color: _backgroundColor,
        borderRadius: BorderRadius.circular(20.r),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6.w,
            height: 6.w,
            decoration: BoxDecoration(
              color: _dotColor,
              shape: BoxShape.circle,
            ),
          ),
          SizedBox(width: 6.w),
          Text(
            _displayLabel,
            style: AppTextStyles.labelSmall.copyWith(
              color: _textColor,
              fontWeight: FontWeight.w600,
              fontSize: 11.sp,
            ),
          ),
        ],
      ),
    );
  }
}
