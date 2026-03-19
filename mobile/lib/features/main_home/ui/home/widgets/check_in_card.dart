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
    return Container(
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
                    state.isCheckedIn ? 'Checked In' : 'Not Checked In',
                    style: AppTextStyles.labelLarge.copyWith(color: Colors.white70),
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
                  state.isCheckedIn ? Icons.login_rounded : Icons.logout_rounded,
                  color: Colors.white,
                  size: 24.sp,
                ),
              ),
            ],
          ),
          SizedBox(height: 20.w),
          Row(
            children: [
              _buildStatItem(label: "Today's Hours", value: state.todayHours),
              SizedBox(width: 24.w),
              _buildStatItem(
                label: 'Status',
                value: state.isCheckedIn ? 'Working' : 'Off',
              ),
            ],
          ),
          SizedBox(height: 20.w),
          GestureDetector(
            onTap: () => context.push(AppRoutes.checkIn),
            child: Container(
              padding: EdgeInsets.symmetric(vertical: 12.w),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12.r),
              ),
              child: Center(
                child: Text(
                  state.isCheckedIn ? 'Check Out' : 'Check In',
                  style: AppTextStyles.labelLarge.copyWith(color: AppColors.primary),
                ),
              ),
            ),
          ),
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
