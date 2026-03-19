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
        label: 'Request\nLeave',
        icon: Icons.beach_access_rounded,
        color: const Color(0xFF8B5CF6),
        route: AppRoutes.leaveRequest,
      ),
      _QuickAction(
        label: 'Overtime\nRequest',
        icon: Icons.more_time_rounded,
        color: const Color(0xFFF59E0B),
        route: AppRoutes.otRequest,
      ),
      _QuickAction(
        label: 'View\nPayslip',
        icon: Icons.receipt_long_rounded,
        color: const Color(0xFF3B82F6),
        route: AppRoutes.payslip,
      ),
      _QuickAction(
        label: 'Attendance\nHistory',
        icon: Icons.history_rounded,
        color: const Color(0xFF22C55E),
        route: AppRoutes.attendanceHistory,
      ),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Quick Actions', style: AppTextStyles.h4),
        SizedBox(height: 16.w),
        Row(
          children: actions
              .map((action) => Expanded(
                    child: Padding(
                      padding: EdgeInsets.only(
                        right: actions.last == action ? 0 : 12.w,
                      ),
                      child: _QuickActionCard(action: action),
                    ),
                  ))
              .toList(),
        ),
      ],
    );
  }
}

class _QuickActionCard extends StatelessWidget {
  const _QuickActionCard({required this.action});

  final _QuickAction action;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push(action.route),
      child: Container(
        padding: EdgeInsets.all(12.w),
        decoration: BoxDecoration(
          color: AppColors.surface,
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
