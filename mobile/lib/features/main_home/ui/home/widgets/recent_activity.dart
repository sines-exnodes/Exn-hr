import 'package:exn_hr/core/themes/app_colors.dart';
import 'package:exn_hr/core/themes/app_text_styles.dart';
import 'package:exn_hr/features/main_home/ui/home/models/home_activity_preview.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class RecentActivity extends StatelessWidget {
  const RecentActivity({super.key, required this.items});

  final List<HomeActivityPreview> items;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Hoạt động gần đây', style: AppTextStyles.h4),
        SizedBox(height: 12.w),
        if (items.isEmpty)
          _buildEmpty()
        else
          ...items.asMap().entries.map(
                (e) => TweenAnimationBuilder<double>(
                  tween: Tween(begin: 0, end: 1),
                  duration: Duration(milliseconds: 320 + e.key * 50),
                  curve: Curves.easeOutCubic,
                  builder: (context, t, child) => Opacity(
                    opacity: t,
                    child: Transform.translate(
                      offset: Offset(0, 8 * (1 - t)),
                      child: child,
                    ),
                  ),
                  child: Padding(
                    padding: EdgeInsets.only(bottom: 8.w),
                    child: _ActivityTile(preview: e.value),
                  ),
                ),
              ),
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
            Text('Chưa có hoạt động', style: AppTextStyles.bodySmall),
          ],
        ),
      ),
    );
  }
}

class _ActivityTile extends StatelessWidget {
  const _ActivityTile({required this.preview});

  final HomeActivityPreview preview;

  @override
  Widget build(BuildContext context) {
    return Container(
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
              color: preview.color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(10.r),
            ),
            child: Icon(preview.icon, color: preview.color, size: 20.sp),
          ),
          SizedBox(width: 12.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(preview.title, style: AppTextStyles.labelMedium),
                SizedBox(height: 2.w),
                Text(preview.subtitle, style: AppTextStyles.caption),
              ],
            ),
          ),
          Text(preview.timeLabel, style: AppTextStyles.caption),
        ],
      ),
    );
  }
}
