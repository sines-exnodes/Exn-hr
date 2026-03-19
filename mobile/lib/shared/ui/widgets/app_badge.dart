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
        return AppColors.pending.withOpacity(0.12);
      case AppBadgeStatus.approved:
        return AppColors.approved.withOpacity(0.12);
      case AppBadgeStatus.rejected:
        return AppColors.rejected.withOpacity(0.12);
      case AppBadgeStatus.info:
        return AppColors.info.withOpacity(0.12);
    }
  }

  Color get _textColor {
    switch (status) {
      case AppBadgeStatus.pending:
        return AppColors.pending;
      case AppBadgeStatus.approved:
        return AppColors.approved;
      case AppBadgeStatus.rejected:
        return AppColors.rejected;
      case AppBadgeStatus.info:
        return AppColors.info;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 4.w),
      decoration: BoxDecoration(
        color: _backgroundColor,
        borderRadius: BorderRadius.circular(20.r),
      ),
      child: Text(
        label,
        style: AppTextStyles.labelSmall.copyWith(color: _textColor),
      ),
    );
  }
}
