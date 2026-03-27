import 'package:exn_hr/config/di.dart';
import 'package:exn_hr/core/routing/app_router.dart';
import 'package:exn_hr/core/themes/app_colors.dart';
import 'package:exn_hr/core/themes/app_text_styles.dart';
import 'package:exn_hr/core/utils/date_utils.dart';
import 'package:exn_hr/core/widgets/animations/animations.dart';
import 'package:exn_hr/features/overtime/ui/list/view_models/ot_list_cubit.dart';
import 'package:exn_hr/features/overtime/ui/list/view_models/ot_list_state.dart';
import 'package:exn_hr/shared/ui/widgets/app_badge.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';

class OtListPage extends StatelessWidget {
  const OtListPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<OtListCubit>(),
      child: const _OtListView(),
    );
  }
}

class _OtListView extends StatelessWidget {
  const _OtListView();

  Color _statusAccentColor(String status) {
    switch (status.toLowerCase()) {
      case 'approved':
        return AppColors.success;
      case 'rejected':
        return AppColors.error;
      default:
        return AppColors.warning;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgPage,
      appBar: AppBar(
        title: const Text('Đơn làm thêm (OT)'),
        automaticallyImplyLeading: false,
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final created = await context.push<bool>(AppRoutes.otRequest);
          if (created == true && context.mounted) {
            context.read<OtListCubit>().loadList();
          }
        },
        backgroundColor: AppColors.primary,
        elevation: 4,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16.r)),
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: BlocBuilder<OtListCubit, OtListState>(
        builder: (context, state) {
          if (state.status == OtListStatus.loading) {
            return Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            );
          }
          if (state.status == OtListStatus.failure) {
            return _buildError(context, state.errorMessage);
          }
          if (state.requests.isEmpty) {
            return _buildEmpty();
          }
          return RefreshIndicator(
            onRefresh: () => context.read<OtListCubit>().loadList(),
            color: AppColors.primary,
            child: ListView.builder(
              padding: EdgeInsets.all(16.w),
              itemCount: state.requests.length,
              itemBuilder: (context, index) {
                final req = state.requests[index];
                return AnimatedListItem(
                  index: index,
                  child: Container(
                    margin: EdgeInsets.only(bottom: 12.w),
                    decoration: BoxDecoration(
                      color: AppColors.bgCard,
                      borderRadius: BorderRadius.circular(16.r),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.04),
                          blurRadius: 10,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(16.r),
                      child: IntrinsicHeight(
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Container(
                              width: 4.w,
                              color: _statusAccentColor(req.overallStatus),
                            ),
                            Expanded(
                              child: Padding(
                                padding: EdgeInsets.all(16.w),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        Row(
                                          children: [
                                            Container(
                                              width: 32.w,
                                              height: 32.w,
                                              decoration: BoxDecoration(
                                                color: AppColors.accentAmberBg,
                                                borderRadius:
                                                    BorderRadius.circular(8.r),
                                              ),
                                              child: Icon(
                                                Icons.more_time_rounded,
                                                color: AppColors.accentAmber,
                                                size: 16.sp,
                                              ),
                                            ),
                                            SizedBox(width: 10.w),
                                            Text(formatDateDisplay(req.date),
                                                style: AppTextStyles.labelLarge),
                                          ],
                                        ),
                                        AppBadge(
                                          label: req.overallStatus,
                                          status: _badgeStatus(req.overallStatus),
                                        ),
                                      ],
                                    ),
                                    SizedBox(height: 12.w),
                                    Row(
                                      children: [
                                        Icon(Icons.schedule_rounded,
                                            size: 14.sp,
                                            color: AppColors.textSecondary),
                                        SizedBox(width: 6.w),
                                        Text(
                                          '${req.startTime} — ${req.endTime}',
                                          style: AppTextStyles.bodySmall,
                                        ),
                                        SizedBox(width: 10.w),
                                        Container(
                                          padding: EdgeInsets.symmetric(
                                              horizontal: 8.w, vertical: 2.w),
                                          decoration: BoxDecoration(
                                            color: AppColors.bgSurface,
                                            borderRadius:
                                                BorderRadius.circular(6.r),
                                          ),
                                          child: Text(
                                            '${req.hours}h',
                                            style: AppTextStyles.caption
                                                .copyWith(
                                                    fontWeight: FontWeight.w600),
                                          ),
                                        ),
                                        SizedBox(width: 6.w),
                                        Container(
                                          padding: EdgeInsets.symmetric(
                                              horizontal: 8.w, vertical: 2.w),
                                          decoration: BoxDecoration(
                                            color: AppColors.infoBg,
                                            borderRadius:
                                                BorderRadius.circular(6.r),
                                          ),
                                          child: Text(
                                            req.otTypeLabel,
                                            style: AppTextStyles.caption
                                                .copyWith(
                                              color: AppColors.info,
                                              fontWeight: FontWeight.w600,
                                              fontSize: 10.sp,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    SizedBox(height: 6.w),
                                    Text(req.reason,
                                        style: AppTextStyles.caption,
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
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

  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 64.w,
            height: 64.w,
            decoration: BoxDecoration(
              color: AppColors.accentAmberBg,
              borderRadius: BorderRadius.circular(20.r),
            ),
            child: Icon(Icons.more_time_rounded,
                size: 32.sp, color: AppColors.accentAmber),
          ),
          SizedBox(height: 16.w),
          Text('Chưa có đơn làm thêm',
              style: AppTextStyles.bodyMedium
                  .copyWith(fontWeight: FontWeight.w600)),
          SizedBox(height: 4.w),
          Text('Nhấn + để tạo đơn mới', style: AppTextStyles.caption),
        ],
      ),
    );
  }

  Widget _buildError(BuildContext context, String? message) {
    return Center(
      child: Padding(
        padding: EdgeInsets.all(24.w),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 64.w,
              height: 64.w,
              decoration: BoxDecoration(
                color: AppColors.errorBg,
                borderRadius: BorderRadius.circular(20.r),
              ),
              child:
                  Icon(Icons.error_outline, size: 32.sp, color: AppColors.error),
            ),
            SizedBox(height: 16.w),
            Text(
              message ?? 'Không tải được danh sách',
              style: AppTextStyles.bodyMedium,
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 16.w),
            TextButton.icon(
              onPressed: () => context.read<OtListCubit>().loadList(),
              icon: const Icon(Icons.refresh_rounded),
              label: const Text('Thử lại'),
            ),
          ],
        ),
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
