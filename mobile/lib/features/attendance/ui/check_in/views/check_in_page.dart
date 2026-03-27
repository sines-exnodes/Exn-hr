import 'package:exn_hr/config/di.dart';
import 'package:exn_hr/core/themes/app_colors.dart';
import 'package:exn_hr/core/themes/app_text_styles.dart';
import 'package:exn_hr/features/attendance/ui/check_in/view_models/check_in_cubit.dart';
import 'package:exn_hr/features/attendance/ui/check_in/view_models/check_in_state.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';

class CheckInPage extends StatelessWidget {
  const CheckInPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<CheckInCubit>()..detectLocation(),
      child: const _CheckInView(),
    );
  }
}

class _CheckInView extends StatelessWidget {
  const _CheckInView();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Chấm công'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: BlocConsumer<CheckInCubit, CheckInState>(
        listener: (context, state) {
          if (state.status == CheckInStatus.success) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(
                  state.isCheckedIn ? 'Chấm vào thành công!' : 'Chấm ra thành công!',
                ),
                backgroundColor: AppColors.success,
              ),
            );
            context.pop();
          } else if (state.status == CheckInStatus.failure) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.errorMessage ?? 'Thất bại'),
                backgroundColor: AppColors.error,
              ),
            );
          }
        },
        builder: (context, state) {
          return SingleChildScrollView(
            padding: EdgeInsets.all(24.w),
            child: Column(
              children: [
                SizedBox(height: 32.w),
                _buildBigButton(context, state),
                SizedBox(height: 40.w),
                _buildStatusCards(state),
                SizedBox(height: 32.w),
                _buildCurrentTime(),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildBigButton(BuildContext context, CheckInState state) {
    final isLoading = state.status == CheckInStatus.loading;
    return GestureDetector(
      onTap: isLoading ? null : () => context.read<CheckInCubit>().checkIn(),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        width: 200.w,
        height: 200.w,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: RadialGradient(
            colors: [
              AppColors.primary,
              AppColors.primaryDark,
            ],
          ),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withOpacity(0.4),
              blurRadius: 30,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Center(
          child: isLoading
              ? const CircularProgressIndicator(color: Colors.white, strokeWidth: 3)
              : Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      state.isCheckedIn ? Icons.logout_rounded : Icons.login_rounded,
                      size: 48.sp,
                      color: Colors.white,
                    ),
                    SizedBox(height: 8.w),
                    Text(
                      state.isCheckedIn ? 'Chấm ra' : 'Chấm vào',
                      style: AppTextStyles.h4.copyWith(color: Colors.white),
                    ),
                  ],
                ),
        ),
      ),
    );
  }

  Widget _buildStatusCards(CheckInState state) {
    return Row(
      children: [
        Expanded(child: _buildStatusCard(
          icon: Icons.location_on_outlined,
          label: 'GPS',
          status: _locationStatusText(state.locationStatus),
          isActive: state.locationStatus == LocationStatus.granted,
        )),
        SizedBox(width: 12.w),
        Expanded(child: _buildStatusCard(
          icon: Icons.wifi_outlined,
          label: 'WiFi',
          status: state.wifiSsid ?? 'Chưa phát hiện',
          isActive: state.wifiSsid != null,
        )),
      ],
    );
  }

  String _locationStatusText(LocationStatus status) {
    switch (status) {
      case LocationStatus.unknown:
        return 'Chưa xác định';
      case LocationStatus.detecting:
        return 'Đang dò...';
      case LocationStatus.granted:
        return 'Đã phát hiện';
      case LocationStatus.denied:
        return 'Bị từ chối';
    }
  }

  Widget _buildStatusCard({
    required IconData icon,
    required String label,
    required String status,
    required bool isActive,
  }) {
    return Container(
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(
          color: isActive ? AppColors.primary.withOpacity(0.3) : AppColors.border,
        ),
      ),
      child: Column(
        children: [
          Icon(
            icon,
            size: 28.sp,
            color: isActive ? AppColors.primary : AppColors.textHint,
          ),
          SizedBox(height: 8.w),
          Text(label, style: AppTextStyles.labelMedium),
          SizedBox(height: 4.w),
          Text(
            status,
            style: AppTextStyles.caption.copyWith(
              color: isActive ? AppColors.primary : AppColors.textHint,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCurrentTime() {
    final now = DateTime.now();
    final timeStr = '${now.hour.toString().padLeft(2, '0')}:'
        '${now.minute.toString().padLeft(2, '0')}';
    final dateStr = '${now.day}/${now.month}/${now.year}';
    return Column(
      children: [
        Text(timeStr, style: AppTextStyles.h1.copyWith(fontSize: 40.sp)),
        SizedBox(height: 4.w),
        Text(dateStr, style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary)),
      ],
    );
  }
}
