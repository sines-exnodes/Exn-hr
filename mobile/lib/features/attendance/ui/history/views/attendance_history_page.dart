import 'package:exn_hr/config/di.dart';
import 'package:exn_hr/core/themes/app_colors.dart';
import 'package:exn_hr/core/themes/app_text_styles.dart';
import 'package:exn_hr/features/attendance/ui/history/view_models/attendance_history_cubit.dart';
import 'package:exn_hr/features/attendance/ui/history/view_models/attendance_history_state.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';

class AttendanceHistoryPage extends StatelessWidget {
  const AttendanceHistoryPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<AttendanceHistoryCubit>(),
      child: const _AttendanceHistoryView(),
    );
  }
}

class _AttendanceHistoryView extends StatelessWidget {
  const _AttendanceHistoryView();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Attendance History'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: BlocBuilder<AttendanceHistoryCubit, AttendanceHistoryState>(
        builder: (context, state) {
          if (state.status == AttendanceHistoryStatus.loading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state.status == AttendanceHistoryStatus.failure) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.error_outline, size: 48.sp, color: AppColors.error),
                  SizedBox(height: 12.w),
                  Text(state.errorMessage ?? 'Failed to load', style: AppTextStyles.bodyMedium),
                  SizedBox(height: 16.w),
                  TextButton(
                    onPressed: () => context.read<AttendanceHistoryCubit>().loadHistory(),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }
          if (state.records.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.history_rounded, size: 48.sp, color: AppColors.textHint),
                  SizedBox(height: 12.w),
                  Text('No attendance records', style: AppTextStyles.bodyMedium),
                ],
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () => context.read<AttendanceHistoryCubit>().loadHistory(),
            color: AppColors.primary,
            child: ListView.builder(
              padding: EdgeInsets.all(16.w),
              itemCount: state.records.length,
              itemBuilder: (context, index) {
                final record = state.records[index];
                return Container(
                  margin: EdgeInsets.only(bottom: 10.w),
                  padding: EdgeInsets.all(16.w),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(12.r),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 44.w,
                        height: 44.w,
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(10.r),
                        ),
                        child: Icon(
                          Icons.calendar_today_rounded,
                          color: AppColors.primary,
                          size: 20.sp,
                        ),
                      ),
                      SizedBox(width: 12.w),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(record.date, style: AppTextStyles.labelMedium),
                            SizedBox(height: 4.w),
                            Text(
                              'In: ${record.checkInTime ?? "--:--"}  Out: ${record.checkOutTime ?? "--:--"}',
                              style: AppTextStyles.bodySmall,
                            ),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(record.totalHours ?? '0h', style: AppTextStyles.labelMedium),
                          Text('Total', style: AppTextStyles.caption),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
