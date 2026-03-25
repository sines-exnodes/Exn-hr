import 'package:exn_hr/core/routing/app_router.dart';
import 'package:exn_hr/core/themes/app_colors.dart';
import 'package:exn_hr/core/themes/app_text_styles.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';

class QuickActions extends StatelessWidget {
  const QuickActions({super.key});

  @override
  Widget build(BuildContext context) {
    final actions = [
      _QuickAction(
        label: 'Đơn\nnghỉ phép',
        icon: Icons.beach_access_rounded,
        color: const Color(0xFF8B5CF6),
        route: AppRoutes.leaveRequest,
      ),
      _QuickAction(
        label: 'Đơn\nlàm thêm',
        icon: Icons.more_time_rounded,
        color: const Color(0xFFF59E0B),
        route: AppRoutes.otRequest,
      ),
      _QuickAction(
        label: 'Phiếu\nlương',
        icon: Icons.receipt_long_rounded,
        color: const Color(0xFF3B82F6),
        route: AppRoutes.payslip,
      ),
      _QuickAction(
        label: 'Lịch sử\nchấm công',
        icon: Icons.history_rounded,
        color: const Color(0xFF22C55E),
        route: AppRoutes.attendanceHistory,
      ),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Thao tác nhanh', style: AppTextStyles.h4),
        SizedBox(height: 16.w),
        Row(
          children: actions
              .asMap()
              .entries
              .map((e) => Expanded(
                    child: Padding(
                      padding: EdgeInsets.only(
                        right: e.key < actions.length - 1 ? 12.w : 0,
                      ),
                      child: _QuickActionCard(
                        action: e.value,
                        index: e.key,
                      ),
                    ),
                  ))
              .toList(),
        ),
      ],
    );
  }
}

class _QuickActionCard extends StatelessWidget {
  const _QuickActionCard({required this.action, required this.index});

  final _QuickAction action;
  final int index;

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: Duration(milliseconds: 400 + index * 55),
      curve: Curves.easeOutCubic,
      builder: (context, t, child) => Opacity(
        opacity: t,
        child: Transform.translate(
          offset: Offset(0, 10 * (1 - t)),
          child: child,
        ),
      ),
      child: Material(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14.r),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: () => context.push(action.route),
          splashColor: action.color.withOpacity(0.14),
          highlightColor: action.color.withOpacity(0.06),
          child: Container(
            padding: EdgeInsets.all(12.w),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14.r),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                Container(
                  width: 44.w,
                  height: 44.w,
                  decoration: BoxDecoration(
                    color: action.color.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(12.r),
                  ),
                  child: Icon(action.icon, color: action.color, size: 22.sp),
                ),
                SizedBox(height: 8.w),
                Text(
                  action.label,
                  style: AppTextStyles.caption,
                  textAlign: TextAlign.center,
                ),
              ],
            ),
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
    required this.route,
  });

  final String label;
  final IconData icon;
  final Color color;
  final String route;
}
