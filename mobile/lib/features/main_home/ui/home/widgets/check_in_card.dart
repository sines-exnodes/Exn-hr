import 'package:exn_hr/core/routing/app_router.dart';
import 'package:exn_hr/core/themes/app_colors.dart';
import 'package:exn_hr/core/themes/app_text_styles.dart';
import 'package:exn_hr/features/main_home/ui/home/view_models/home_state.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';

class CheckInCard extends StatelessWidget {
  const CheckInCard({super.key, required this.state});

  final HomeState state;

  @override
  Widget build(BuildContext context) {
    if (state.status == HomeStatus.loading) {
      return _buildSkeleton();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (state.attendanceWarning != null) ...[
          Container(
            padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 12.w),
            margin: EdgeInsets.only(bottom: 12.w),
            decoration: BoxDecoration(
              color: AppColors.warningBg,
              borderRadius: BorderRadius.circular(14.r),
              border: Border.all(color: AppColors.warning.withOpacity(0.25)),
            ),
            child: Row(
              children: [
                Container(
                  width: 32.w,
                  height: 32.w,
                  decoration: BoxDecoration(
                    color: AppColors.warning.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(8.r),
                  ),
                  child: Icon(Icons.warning_amber_rounded,
                      color: AppColors.warning, size: 18.sp),
                ),
                SizedBox(width: 10.w),
                Expanded(
                  child: Text(
                    state.attendanceWarning!,
                    style: AppTextStyles.bodySmall
                        .copyWith(color: AppColors.textPrimary),
                  ),
                ),
              ],
            ),
          ),
        ],
        Container(
          padding: EdgeInsets.all(20.w),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: state.isCheckedIn
                  ? [const Color(0xFF059669), const Color(0xFF047857)]
                  : [AppColors.gradientStart, AppColors.gradientEnd],
            ),
            borderRadius: BorderRadius.circular(20.r),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withOpacity(0.3),
                blurRadius: 24,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: EdgeInsets.symmetric(
                            horizontal: 10.w, vertical: 4.w),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(20.r),
                        ),
                        child: Text(
                          state.isCheckedIn ? 'Đã chấm vào' : 'Chưa chấm công',
                          style: AppTextStyles.labelSmall
                              .copyWith(color: Colors.white.withOpacity(0.9)),
                        ),
                      ),
                      SizedBox(height: 10.w),
                      Text(
                        state.checkInTime ?? '--:--',
                        style: AppTextStyles.h1.copyWith(
                          color: Colors.white,
                          fontSize: 36.sp,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    width: 56.w,
                    height: 56.w,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(16.r),
                      border: Border.all(
                        color: Colors.white.withOpacity(0.1),
                      ),
                    ),
                    child: Icon(
                      state.isCheckedIn
                          ? Icons.check_circle_outline_rounded
                          : Icons.access_time_rounded,
                      color: Colors.white,
                      size: 28.sp,
                    ),
                  ),
                ],
              ),
              SizedBox(height: 20.w),
              // Stats row with glass containers
              Row(
                children: [
                  Expanded(child: _buildStatChip(
                    icon: Icons.schedule_rounded,
                    label: 'Giờ hôm nay',
                    value: state.todayHours,
                  )),
                  SizedBox(width: 12.w),
                  Expanded(child: _buildStatChip(
                    icon: Icons.circle,
                    label: 'Trạng thái',
                    value: state.isCheckedIn ? 'Đang làm' : 'Nghỉ',
                  )),
                ],
              ),
              SizedBox(height: 20.w),
              // CTA button
              Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: () => context.push(AppRoutes.checkIn),
                  borderRadius: BorderRadius.circular(14.r),
                  child: Ink(
                    padding: EdgeInsets.symmetric(vertical: 14.w),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14.r),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          state.isCheckedIn
                              ? Icons.logout_rounded
                              : Icons.login_rounded,
                          color: AppColors.primary,
                          size: 20.sp,
                        ),
                        SizedBox(width: 8.w),
                        Text(
                          state.isCheckedIn ? 'Chấm ra' : 'Chấm vào',
                          style: AppTextStyles.labelLarge
                              .copyWith(color: AppColors.primary),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStatChip({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 10.w),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.12),
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label,
              style: AppTextStyles.caption
                  .copyWith(color: Colors.white.withOpacity(0.7), fontSize: 10.sp)),
          SizedBox(height: 4.w),
          Text(value,
              style: AppTextStyles.labelLarge.copyWith(color: Colors.white)),
        ],
      ),
    );
  }

  Widget _buildSkeleton() {
    return Container(
      height: 220.w,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: AppColors.bgSurface,
        borderRadius: BorderRadius.circular(20.r),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SizedBox(
            width: 28.w,
            height: 28.w,
            child: CircularProgressIndicator(
              strokeWidth: 2.5,
              color: AppColors.primary,
            ),
          ),
          SizedBox(height: 12.w),
          Text('Đang tải chấm công…', style: AppTextStyles.caption),
        ],
      ),
    );
  }
}
