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
      return _buildSkeleton(context);
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (state.attendanceWarning != null) ...[
          Container(
            padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 10.w),
            margin: EdgeInsets.only(bottom: 10.w),
            decoration: BoxDecoration(
              color: AppColors.warning.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12.r),
              border: Border.all(color: AppColors.warning.withOpacity(0.35)),
            ),
            child: Row(
              children: [
                Icon(Icons.warning_amber_rounded,
                    color: AppColors.warning, size: 20.sp),
                SizedBox(width: 8.w),
                Expanded(
                  child: Text(
                    state.attendanceWarning!,
                    style: AppTextStyles.caption
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
              colors: [AppColors.primary, AppColors.primaryDark],
            ),
            borderRadius: BorderRadius.circular(20.r),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withOpacity(0.3),
                blurRadius: 20,
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
                      Text(
                        state.isCheckedIn ? 'Đã chấm vào' : 'Chưa chấm công',
                        style:
                            AppTextStyles.labelLarge.copyWith(color: Colors.white70),
                      ),
                      SizedBox(height: 4.w),
                      Text(
                        state.checkInTime ?? '--:--',
                        style: AppTextStyles.h3.copyWith(color: Colors.white),
                      ),
                    ],
                  ),
                  Container(
                    width: 48.w,
                    height: 48.w,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12.r),
                    ),
                    child: Icon(
                      state.isCheckedIn
                          ? Icons.login_rounded
                          : Icons.logout_rounded,
                      color: Colors.white,
                      size: 24.sp,
                    ),
                  ),
                ],
              ),
              SizedBox(height: 20.w),
              Row(
                children: [
                  _buildStatItem(label: 'Giờ hôm nay', value: state.todayHours),
                  SizedBox(width: 24.w),
                  _buildStatItem(
                    label: 'Trạng thái',
                    value: state.isCheckedIn ? 'Đang làm' : 'Nghỉ',
                  ),
                ],
              ),
              SizedBox(height: 20.w),
              Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: () => context.push(AppRoutes.checkIn),
                  borderRadius: BorderRadius.circular(12.r),
                  child: Ink(
                    padding: EdgeInsets.symmetric(vertical: 12.w),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12.r),
                    ),
                    child: Center(
                      child: Text(
                        state.isCheckedIn ? 'Chấm ra' : 'Chấm vào',
                        style: AppTextStyles.labelLarge
                            .copyWith(color: AppColors.primary),
                      ),
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

  Widget _buildSkeleton(BuildContext context) {
    return Container(
      height: 200.w,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20.r),
        border: Border.all(color: AppColors.border),
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

  Widget _buildStatItem({required String label, required String value}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTextStyles.caption.copyWith(color: Colors.white70)),
        SizedBox(height: 2.w),
        Text(value, style: AppTextStyles.labelMedium.copyWith(color: Colors.white)),
      ],
    );
  }
}
