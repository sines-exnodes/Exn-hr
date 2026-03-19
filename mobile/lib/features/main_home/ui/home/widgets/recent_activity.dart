import 'package:exn_hr/core/themes/app_colors.dart';
import 'package:exn_hr/core/themes/app_text_styles.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class RecentActivity extends StatelessWidget {
  const RecentActivity({super.key, this.activities = const []});

  final List<ActivityItem> activities;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Recent Activity', style: AppTextStyles.h4),
        SizedBox(height: 12.w),
        if (activities.isEmpty)
          _buildEmpty()
        else
          ...activities.map((a) => _ActivityTile(activity: a)).toList(),
      ],
    );
  }

  Widget _buildEmpty() {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 24.w),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(color: AppColors.border),
      ),
      child: Center(
        child: Column(
          children: [
            Icon(Icons.inbox_rounded, size: 40.sp, color: AppColors.textHint),
            SizedBox(height: 8.w),
            Text('No recent activity', style: AppTextStyles.bodySmall),
          ],
        ),
      ),
    );
  }
}

class _ActivityTile extends StatelessWidget {
  const _ActivityTile({required this.activity});

  final ActivityItem activity;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.only(bottom: 8.w),
      padding: EdgeInsets.all(14.w),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Container(
            width: 40.w,
            height: 40.w,
            decoration: BoxDecoration(
              color: activity.color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(10.r),
            ),
            child: Icon(activity.icon, color: activity.color, size: 20.sp),
          ),
          SizedBox(width: 12.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(activity.title, style: AppTextStyles.labelMedium),
                SizedBox(height: 2.w),
                Text(activity.subtitle, style: AppTextStyles.caption),
              ],
            ),
          ),
          Text(activity.time, style: AppTextStyles.caption),
        ],
      ),
    );
  }
}

class ActivityItem {
  const ActivityItem({
    required this.title,
    required this.subtitle,
    required this.time,
    required this.icon,
    required this.color,
  });

  final String title;
  final String subtitle;
  final String time;
  final IconData icon;
  final Color color;
}
