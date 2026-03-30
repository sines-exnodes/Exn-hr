import 'package:exn_hr/config/di.dart';
import 'package:exn_hr/core/themes/app_colors.dart';
import 'package:exn_hr/core/themes/app_text_styles.dart';
import 'package:exn_hr/features/leave/ui/approval/view_models/leave_approval_cubit.dart';
import 'package:exn_hr/features/leave/ui/approval/view_models/leave_approval_state.dart';
import 'package:exn_hr/core/utils/date_utils.dart';
import 'package:exn_hr/shared/ui/widgets/app_button.dart';
import 'package:exn_hr/core/widgets/animations/animations.dart';
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

  Future<void> _confirmReject(BuildContext context, int id) async {
    final go = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Từ chối đơn nghỉ?'),
        content: const Text(
          'Hệ thống sẽ gửi trạng thái từ chối lên máy chủ.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Hủy'),
          ),
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: Text('Từ chối', style: TextStyle(color: AppColors.error)),
          ),
        ],
      ),
    );
    if (go == true && context.mounted) {
      context.read<LeaveApprovalCubit>().reject(id);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Duyệt nghỉ phép'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: BlocConsumer<LeaveApprovalCubit, LeaveApprovalState>(
        listener: (context, state) {
          if (state.status == LeaveApprovalStatus.failure &&
              state.errorMessage != null) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.errorMessage!),
                backgroundColor: AppColors.error,
              ),
            );
          }
        },
        builder: (context, state) {
          if (state.status == LeaveApprovalStatus.loading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state.requests.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.check_circle_outline,
                      size: 48.sp, color: AppColors.success),
                  SizedBox(height: 12.w),
                  Text('Không có đơn chờ duyệt',
                      style: AppTextStyles.bodyMedium),
                ],
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () =>
                context.read<LeaveApprovalCubit>().loadPendingRequests(),
            color: AppColors.primary,
            child: ListView.builder(
              padding: EdgeInsets.all(16.w),
              itemCount: state.requests.length,
              itemBuilder: (context, index) {
                final req = state.requests[index];
                final busy = state.actionLoadingId == req.id;
                return AnimatedListItem(
                  index: index,
                  child: Container(
                  margin: EdgeInsets.only(bottom: 12.w),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(12.r),
                    border: Border.all(color: AppColors.border),
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      if (busy)
                        LinearProgressIndicator(
                          minHeight: 3.w,
                          backgroundColor: AppColors.primary.withOpacity(0.08),
                          color: AppColors.primary,
                        ),
                      Padding(
                        padding: EdgeInsets.all(16.w),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                      Text(req.employeeName ?? 'Nhân viên',
                          style: AppTextStyles.labelLarge),
                      SizedBox(height: 4.w),
                      Text(
                        'Nghỉ ${req.type} · ${req.days} ngày',
                        style: AppTextStyles.bodySmall,
                      ),
                      Text(
                        '${formatDateDisplay(req.startDate)} — ${formatDateDisplay(req.endDate)}',
                        style: AppTextStyles.caption,
                      ),
                      SizedBox(height: 4.w),
                      Text(req.reason,
                          style: AppTextStyles.caption, maxLines: 2),
                      SizedBox(height: 12.w),
                      Row(
                        children: [
                          Expanded(
                            child: AppButton(
                              label: 'Từ chối',
                              type: AppButtonType.outlined,
                              foregroundColor: AppColors.error,
                              height: 44.w,
                              isDisabled: busy,
                              onPressed: () => _confirmReject(context, req.id),
                            ),
                          ),
                          SizedBox(width: 12.w),
                          Expanded(
                            child: AppButton(
                              label: 'Duyệt',
                              height: 44.w,
                              isDisabled: busy,
                              onPressed: () => context
                                  .read<LeaveApprovalCubit>()
                                  .approve(req.id),
                            ),
                          ),
                        ],
                      ),
                          ],
                        ),
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
