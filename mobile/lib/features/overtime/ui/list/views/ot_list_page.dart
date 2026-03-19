import 'package:exn_hr/config/di.dart';
import 'package:exn_hr/core/routing/app_router.dart';
import 'package:exn_hr/core/themes/app_colors.dart';
import 'package:exn_hr/core/themes/app_text_styles.dart';
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Overtime Requests'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push(AppRoutes.otRequest),
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: BlocBuilder<OtListCubit, OtListState>(
        builder: (context, state) {
          if (state.status == OtListStatus.loading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state.requests.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.more_time_rounded, size: 48.sp, color: AppColors.textHint),
                  SizedBox(height: 12.w),
                  Text('No OT requests yet', style: AppTextStyles.bodyMedium),
                ],
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () => context.read<OtListCubit>().loadList(),
            color: AppColors.primary,
            child: ListView.builder(
              padding: EdgeInsets.all(16.w),
              itemCount: state.requests.length,
              itemBuilder: (context, index) {
                final req = state.requests[index];
                return Container(
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
                          Text(req.date, style: AppTextStyles.labelLarge),
                          AppBadge(
                            label: req.status,
                            status: _badgeStatus(req.status),
                          ),
                        ],
                      ),
                      SizedBox(height: 6.w),
                      Text(
                        '${req.startTime} — ${req.endTime}  (${req.totalHours}h)',
                        style: AppTextStyles.bodySmall,
                      ),
                      SizedBox(height: 4.w),
                      Text(req.reason, style: AppTextStyles.caption, maxLines: 2),
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
