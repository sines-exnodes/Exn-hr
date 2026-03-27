import 'package:exn_hr/config/di.dart';
import 'package:exn_hr/core/themes/app_colors.dart';
import 'package:exn_hr/core/themes/app_text_styles.dart';
import 'package:exn_hr/features/attendance/ui/history/view_models/attendance_history_cubit.dart';
import 'package:exn_hr/features/attendance/ui/history/view_models/attendance_history_state.dart';
import 'package:exn_hr/core/widgets/animations/animations.dart';
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
        title: const Text('Lịch sử chấm công'),
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
                  Text(state.errorMessage ?? 'Không tải được dữ liệu', style: AppTextStyles.bodyMedium),
                  SizedBox(height: 16.w),
                  TextButton(
                    onPressed: () => context.read<AttendanceHistoryCubit>().loadHistory(),
                    child: const Text('Thử lại'),
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
                  Text('Chưa có lịch sử chấm công', style: AppTextStyles.bodyMedium),
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
                final dateLabel = record.checkInTime != null
                    ? record.checkInTime!.length >= 10
                        ? record.checkInTime!.substring(0, 10)
                        : record.checkInTime!
                    : '--';
                String hoursLabel = '0h';
                if (record.checkInTime != null && record.checkOutTime != null) {
                  try {
                    final inDt = DateTime.parse(record.checkInTime!);
                    final outDt = DateTime.parse(record.checkOutTime!);
                    final diff = outDt.difference(inDt);
                    final h = diff.inHours;
                    final m = diff.inMinutes.remainder(60);
                    hoursLabel = '${h}h ${m}m';
                  } catch (_) {
                    hoursLabel = '0h';
                  }
                }
                return AnimatedListItem(
                  index: index,
                  child: Container(
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
                          color: AppColors.primary.withValues(alpha: 0.12),
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
                            Text(dateLabel, style: AppTextStyles.labelMedium),
                            SizedBox(height: 4.w),
                            Text(
                              'Vào: ${record.checkInTime ?? "--:--"}  Ra: ${record.checkOutTime ?? "--:--"}',
                              style: AppTextStyles.bodySmall,
                            ),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(hoursLabel, style: AppTextStyles.labelMedium),
                          Text('Tổng', style: AppTextStyles.caption),
                        ],
                      ),
                    ],
                  ),
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
