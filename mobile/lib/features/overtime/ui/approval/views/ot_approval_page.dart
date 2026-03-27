import 'package:exn_hr/config/di.dart';
import 'package:exn_hr/core/themes/app_colors.dart';
import 'package:exn_hr/core/themes/app_text_styles.dart';
import 'package:exn_hr/features/overtime/domain/entities/ot_request.dart';
import 'package:exn_hr/features/overtime/ui/approval/view_models/ot_approval_cubit.dart';
import 'package:exn_hr/features/overtime/ui/approval/view_models/ot_approval_state.dart';
import 'package:exn_hr/shared/ui/widgets/app_button.dart';
import 'package:exn_hr/core/widgets/animations/animations.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';

class OtApprovalPage extends StatelessWidget {
  const OtApprovalPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<OtApprovalCubit>(),
      child: const _OtApprovalView(),
    );
  }
}

class _OtApprovalView extends StatelessWidget {
  const _OtApprovalView();

  Future<void> _confirmReject(BuildContext context, int id) async {
    final go = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Từ chối đơn OT?'),
        content: const Text(
          'Trạng thái sẽ được gửi lên máy chủ.',
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
      context.read<OtApprovalCubit>().reject(id);
    }
  }

  String _stageLabel(OtRequest r) {
    if (r.leaderStatus.toLowerCase() == 'pending') {
      return 'Chờ leader';
    }
    if (r.leaderStatus.toLowerCase() == 'approved' &&
        r.ceoStatus.toLowerCase() == 'pending') {
      return 'Chờ CEO';
    }
    return r.overallStatus;
  }

  Color _stageColor(OtRequest r) {
    if (r.leaderStatus.toLowerCase() == 'pending') {
      return AppColors.info;
    }
    return AppColors.warning;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Duyệt làm thêm (OT)'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: BlocConsumer<OtApprovalCubit, OtApprovalState>(
        listener: (context, state) {
          if (state.status == OtApprovalStatus.failure &&
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
          if (state.status == OtApprovalStatus.loading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state.requests.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.more_time_rounded,
                      size: 48.sp, color: AppColors.textHint),
                  SizedBox(height: 12.w),
                  Text(
                    'Không có đơn OT cần bạn duyệt',
                    style: AppTextStyles.bodyMedium,
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () =>
                context.read<OtApprovalCubit>().loadPendingRequests(),
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
                            Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    req.employeeName ?? 'Nhân viên',
                                    style: AppTextStyles.labelLarge,
                                  ),
                                ),
                                Container(
                                  padding: EdgeInsets.symmetric(
                                    horizontal: 8.w,
                                    vertical: 4.w,
                                  ),
                                  decoration: BoxDecoration(
                                    color: _stageColor(req).withOpacity(0.12),
                                    borderRadius: BorderRadius.circular(8.r),
                                  ),
                                  child: Text(
                                    _stageLabel(req),
                                    style: AppTextStyles.labelSmall
                                        .copyWith(color: _stageColor(req)),
                                  ),
                                ),
                              ],
                            ),
                            SizedBox(height: 6.w),
                            Row(
                              children: [
                                Text(
                                  '${req.date} · ${req.startTime} — ${req.endTime} (${req.hours}h)',
                                  style: AppTextStyles.bodySmall,
                                ),
                                SizedBox(width: 8.w),
                                Container(
                                  padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 2.w),
                                  decoration: BoxDecoration(
                                    color: AppColors.info.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(4.r),
                                  ),
                                  child: Text(
                                    req.otTypeLabel,
                                    style: AppTextStyles.caption.copyWith(
                                      color: AppColors.info,
                                      fontSize: 10.sp,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            SizedBox(height: 4.w),
                            Text(
                              req.reason,
                              style: AppTextStyles.caption,
                              maxLines: 3,
                            ),
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
                                        .read<OtApprovalCubit>()
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
