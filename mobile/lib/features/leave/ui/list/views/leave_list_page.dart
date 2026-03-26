import 'package:exn_hr/config/di.dart';
import 'package:exn_hr/core/routing/app_router.dart';
import 'package:exn_hr/core/themes/app_colors.dart';
import 'package:exn_hr/core/themes/app_text_styles.dart';
import 'package:exn_hr/core/widgets/animations/animations.dart';
import 'package:exn_hr/features/leave/ui/list/view_models/leave_list_cubit.dart';
import 'package:exn_hr/features/leave/ui/list/view_models/leave_list_state.dart';
import 'package:exn_hr/shared/ui/widgets/app_badge.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';

class LeaveListPage extends StatelessWidget {
  const LeaveListPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<LeaveListCubit>(),
      child: const _LeaveListView(),
    );
  }
}

class _LeaveListView extends StatelessWidget {
  const _LeaveListView();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('My Leave Requests'),
        automaticallyImplyLeading: false,
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push(AppRoutes.leaveRequest),
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: BlocBuilder<LeaveListCubit, LeaveListState>(
        builder: (context, state) {
          if (state.status == LeaveListStatus.loading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state.status == LeaveListStatus.failure) {
            return Center(
              child: Padding(
                padding: EdgeInsets.all(24.w),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.error_outline, size: 48.sp, color: AppColors.error),
                    SizedBox(height: 12.w),
                    Text(
                      state.errorMessage ?? 'Không tải được danh sách',
                      style: AppTextStyles.bodyMedium,
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: 16.w),
                    TextButton(
                      onPressed: () => context.read<LeaveListCubit>().loadList(),
                      child: const Text('Thử lại'),
                    ),
                  ],
                ),
              ),
            );
          }
          if (state.requests.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.beach_access_rounded, size: 48.sp, color: AppColors.textHint),
                  SizedBox(height: 12.w),
                  Text('No leave requests yet', style: AppTextStyles.bodyMedium),
                ],
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () => context.read<LeaveListCubit>().loadList(),
            color: AppColors.primary,
            child: ListView.builder(
              padding: EdgeInsets.all(16.w),
              itemCount: state.requests.length,
              itemBuilder: (context, index) {
                final request = state.requests[index];
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
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '${request.type[0].toUpperCase()}${request.type.substring(1)} Leave',
                            style: AppTextStyles.labelLarge,
                          ),
                          AppBadge(
                            label: request.overallStatus,
                            status: _badgeStatus(request.overallStatus),
                          ),
                        ],
                      ),
                      SizedBox(height: 8.w),
                      Text(
                        '${request.startDate} — ${request.endDate}',
                        style: AppTextStyles.bodySmall,
                      ),
                      SizedBox(height: 4.w),
                      Text(
                        '${request.days} day(s) • ${request.reason}',
                        style: AppTextStyles.caption,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
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

  AppBadgeStatus _badgeStatus(String status) {
    switch (status.toLowerCase()) {
      case 'approved':
        return AppBadgeStatus.approved;
      case 'rejected':
        return AppBadgeStatus.rejected;
      default:
        return AppBadgeStatus.pending;
    }
  }
}
