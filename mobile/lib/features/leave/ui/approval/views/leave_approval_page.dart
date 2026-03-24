import 'package:exn_hr/config/di.dart';
import 'package:exn_hr/core/themes/app_colors.dart';
import 'package:exn_hr/core/themes/app_text_styles.dart';
import 'package:exn_hr/features/leave/ui/approval/view_models/leave_approval_cubit.dart';
import 'package:exn_hr/features/leave/ui/approval/view_models/leave_approval_state.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';

class LeaveApprovalPage extends StatelessWidget {
  const LeaveApprovalPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<LeaveApprovalCubit>(),
      child: const _LeaveApprovalView(),
    );
  }
}

class _LeaveApprovalView extends StatelessWidget {
  const _LeaveApprovalView();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Leave Approvals'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: BlocBuilder<LeaveApprovalCubit, LeaveApprovalState>(
        builder: (context, state) {
          if (state.status == LeaveApprovalStatus.loading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state.requests.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.check_circle_outline, size: 48.sp, color: AppColors.success),
                  SizedBox(height: 12.w),
                  Text('No pending approvals', style: AppTextStyles.bodyMedium),
                ],
              ),
            );
          }
          return ListView.builder(
            padding: EdgeInsets.all(16.w),
            itemCount: state.requests.length,
            itemBuilder: (context, index) {
              final req = state.requests[index];
              return Container(
                margin: EdgeInsets.only(bottom: 12.w),
                padding: EdgeInsets.all(16.w),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(12.r),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(req.employeeName ?? 'Employee', style: AppTextStyles.labelLarge),
                    SizedBox(height: 4.w),
                    Text(
                      '${req.type} leave • ${req.days} day(s)',
                      style: AppTextStyles.bodySmall,
                    ),
                    Text(
                      '${req.startDate} — ${req.endDate}',
                      style: AppTextStyles.caption,
                    ),
                    SizedBox(height: 4.w),
                    Text(req.reason, style: AppTextStyles.caption, maxLines: 2),
                    SizedBox(height: 12.w),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () {},
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: AppColors.error),
                            ),
                            child: Text('Reject',
                                style: AppTextStyles.labelMedium
                                    .copyWith(color: AppColors.error)),
                          ),
                        ),
                        SizedBox(width: 12.w),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () =>
                                context.read<LeaveApprovalCubit>().approve(req.id),
                            child: const Text('Approve'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }
}
