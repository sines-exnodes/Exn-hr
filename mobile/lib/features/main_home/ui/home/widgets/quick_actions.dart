import 'package:exn_hr/core/routing/app_router.dart';
import 'package:exn_hr/core/themes/app_colors.dart';
import 'package:exn_hr/core/themes/app_text_styles.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';

class QuickActions extends StatelessWidget {
  const QuickActions({super.key, this.onActionPush});

  final Future<void> Function(String route)? onActionPush;

  @override
  Widget build(BuildContext context) {
    final actions = [
      const _QuickAction(
        label: 'Nghỉ phép',
        icon: Icons.beach_access_rounded,
        color: AppColors.accentPurple,
        bgColor: AppColors.accentPurpleBg,
        route: AppRoutes.leaveRequest,
        needsRefresh: true,
      ),
      const _QuickAction(
        label: 'Làm thêm',
        icon: Icons.more_time_rounded,
        color: AppColors.accentAmber,
        bgColor: AppColors.accentAmberBg,
        route: AppRoutes.otRequest,
        needsRefresh: true,
      ),
      const _QuickAction(
        label: 'Phiếu lương',
        icon: Icons.receipt_long_rounded,
        color: AppColors.accentBlue,
        bgColor: AppColors.accentBlueBg,
        route: AppRoutes.payslip,
        needsRefresh: false,
      ),
      const _QuickAction(
        label: 'Chấm công',
        icon: Icons.history_rounded,
        color: AppColors.accentTeal,
        bgColor: AppColors.accentTealBg,
        route: AppRoutes.attendanceHistory,
        needsRefresh: false,
      ),
      const _QuickAction(
        label: 'Dự án',
        icon: Icons.folder_open_rounded,
        color: Color(0xFF059669),
        bgColor: Color(0xFFD1FAE5),
        route: AppRoutes.myProjects,
        needsRefresh: false,
      ),
      const _QuickAction(
        label: 'Thông báo',
        icon: Icons.campaign_rounded,
        color: AppColors.info,
        bgColor: AppColors.infoBg,
        route: AppRoutes.announcements,
        needsRefresh: false,
      ),
    ];

    final firstRow = actions.sublist(0, 3);
    final secondRow = actions.sublist(3);

    Widget buildRow(List<_QuickAction> rowActions, int startIndex) {
      return Row(
        children: rowActions
            .asMap()
            .entries
            .map((e) => Expanded(
                  child: Padding(
                    padding: EdgeInsets.only(
                      right: e.key < rowActions.length - 1 ? 10.w : 0,
                    ),
                    child: _QuickActionCard(
                      action: e.value,
                      index: startIndex + e.key,
                      onActionPush: onActionPush,
                    ),
                  ),
                ))
            .toList(),
      );
    }

    // Second row: 2 items sized to match the top-row card width (1/3 of available width each)
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Thao tác nhanh', style: AppTextStyles.h4),
        SizedBox(height: 14.w),
        buildRow(firstRow, 0),
        SizedBox(height: 10.w),
        buildRow(secondRow, 3),
      ],
    );
  }
}

class _QuickActionCard extends StatelessWidget {
  const _QuickActionCard({
    required this.action,
    required this.index,
    this.onActionPush,
  });

  final _QuickAction action;
  final int index;
  final Future<void> Function(String route)? onActionPush;

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: Duration(milliseconds: 400 + index * 60),
      curve: Curves.easeOutCubic,
      builder: (context, t, child) => Opacity(
        opacity: t,
        child: Transform.translate(
          offset: Offset(0, 12 * (1 - t)),
          child: child,
        ),
      ),
      child: GestureDetector(
        onTap: () {
          if (action.needsRefresh && onActionPush != null) {
            onActionPush!(action.route);
          } else {
            context.push(action.route);
          }
        },
        child: Container(
          padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 16.w),
          decoration: BoxDecoration(
            color: AppColors.bgCard,
            borderRadius: BorderRadius.circular(16.r),
            boxShadow: [
              BoxShadow(
                color: action.color.withValues(alpha: 0.08),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 48.w,
                height: 48.w,
                decoration: BoxDecoration(
                  color: action.bgColor,
                  borderRadius: BorderRadius.circular(14.r),
                ),
                child: Icon(action.icon, color: action.color, size: 24.sp),
              ),
              SizedBox(height: 10.w),
              Text(
                action.label,
                style: AppTextStyles.labelSmall.copyWith(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.w600,
                ),
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _QuickAction {
  const _QuickAction({
    required this.label,
    required this.icon,
    required this.color,
    required this.bgColor,
    required this.route,
    required this.needsRefresh,
  });

  final String label;
  final IconData icon;
  final Color color;
  final Color bgColor;
  final String route;
  final bool needsRefresh;
}
