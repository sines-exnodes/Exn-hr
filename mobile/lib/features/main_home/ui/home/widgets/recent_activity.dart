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
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Hoạt động gần đây', style: AppTextStyles.h4),
            if (items.isNotEmpty)
              Text(
                'Xem tất cả',
                style: AppTextStyles.labelSmall
                    .copyWith(color: AppColors.primary),
              ),
          ],
        ),
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
                    padding: EdgeInsets.only(bottom: 10.w),
                    child: _ActivityTile(preview: e.value),
                  ),
                ),
              ),
      ],
    );
  }

  Widget _buildEmpty() {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 32.w),
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(16.r),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Center(
        child: Column(
          children: [
            Container(
              width: 56.w,
              height: 56.w,
              decoration: BoxDecoration(
                color: AppColors.bgSurface,
                borderRadius: BorderRadius.circular(16.r),
              ),
              child: Icon(Icons.inbox_rounded, size: 28.sp, color: AppColors.textMuted),
            ),
            SizedBox(height: 12.w),
            Text('Chưa có hoạt động', style: AppTextStyles.bodySmall),
            SizedBox(height: 4.w),
            Text(
              'Các hoạt động sẽ hiển thị tại đây',
              style: AppTextStyles.caption.copyWith(color: AppColors.textMuted),
            ),
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
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(14.r),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 42.w,
            height: 42.w,
            decoration: BoxDecoration(
              color: preview.color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12.r),
            ),
            child: Icon(preview.icon, color: preview.color, size: 20.sp),
          ),
          SizedBox(width: 12.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(preview.title,
                    style: AppTextStyles.labelMedium
                        .copyWith(fontWeight: FontWeight.w600)),
                SizedBox(height: 2.w),
                Text(preview.subtitle, style: AppTextStyles.caption),
              ],
            ),
          ),
          Container(
            padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.w),
            decoration: BoxDecoration(
              color: AppColors.bgSurface,
              borderRadius: BorderRadius.circular(8.r),
            ),
            child: Text(preview.timeLabel,
                style: AppTextStyles.caption.copyWith(fontSize: 10.sp)),
          ),
        ],
      ),
    );
  }
}
