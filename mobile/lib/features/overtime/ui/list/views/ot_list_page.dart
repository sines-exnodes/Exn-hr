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

class _OtListView extends StatefulWidget {
  const _OtListView();

  @override
  State<_OtListView> createState() => _OtListViewState();
}

class _OtListViewState extends State<_OtListView> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      context.read<OtListCubit>().loadNextPage();
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

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
      floatingActionButton: TweenAnimationBuilder<double>(
        tween: Tween(begin: 0, end: 1),
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeOutBack,
        builder: (context, value, child) => Transform.scale(
          scale: value,
          child: child,
        ),
        child: FloatingActionButton(
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
      ),
      body: BlocBuilder<OtListCubit, OtListState>(
        builder: (context, state) {
          if (state.status == OtListStatus.loading) {
            return const Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            );
          }
          if (state.status == OtListStatus.failure) {
            return _buildError(context, state.errorMessage);
          }
          if (state.requests.isEmpty) {
            return _buildEmpty();
          }
          final filtered = state.filteredRequests;
          return RefreshIndicator(
            onRefresh: () => context.read<OtListCubit>().loadList(),
            color: AppColors.primary,
            child: ListView.builder(
              controller: _scrollController,
              padding: EdgeInsets.all(16.w),
              itemCount: filtered.length + 2 + (state.isPaginating ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == 0) return _buildSummaryCard(state);
                if (index == 1) return _buildFilterChips(context, state);
                if (index - 2 >= filtered.length) {
                  return Padding(
                    padding: EdgeInsets.symmetric(vertical: 16.w),
                    child: const Center(
                      child: CircularProgressIndicator(),
                    ),
                  );
                }
                final req = filtered[index - 2];
                return AnimatedListItem(
                  index: index,
                  child: Container(
                    margin: EdgeInsets.only(bottom: 12.w),
                    decoration: BoxDecoration(
                      color: AppColors.bgCard,
                      borderRadius: BorderRadius.circular(16.r),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.04),
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

  static const _filterOptions = <String, String>{
    '': 'Tất cả',
    'pending': 'Chờ duyệt',
    'approved': 'Đã duyệt',
    'rejected': 'Từ chối',
  };

  Widget _buildSummaryCard(OtListState state) {
    final hours = state.totalOtHoursThisMonth;
    return Container(
      margin: EdgeInsets.only(bottom: 12.w),
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.gradientStart, AppColors.gradientEnd],
        ),
        borderRadius: BorderRadius.circular(16.r),
        boxShadow: [
          BoxShadow(
            color: AppColors.gradientStart.withValues(alpha: 0.3),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 40.w,
            height: 40.w,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(12.r),
            ),
            child: Icon(Icons.timer_outlined, color: Colors.white, size: 22.sp),
          ),
          SizedBox(width: 12.w),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Tổng OT tháng này',
                style: AppTextStyles.caption.copyWith(
                  color: Colors.white.withValues(alpha: 0.85),
                ),
              ),
              SizedBox(height: 2.w),
              Text(
                '${hours % 1 == 0 ? hours.toInt() : hours.toStringAsFixed(1)} giờ',
                style: AppTextStyles.labelLarge.copyWith(
                  color: Colors.white,
                  fontSize: 18.sp,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChips(BuildContext context, OtListState state) {
    return Padding(
      padding: EdgeInsets.only(bottom: 12.w),
      child: SizedBox(
        height: 36.w,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          itemCount: _filterOptions.length,
          separatorBuilder: (_, __) => SizedBox(width: 8.w),
          itemBuilder: (context, index) {
            final entry = _filterOptions.entries.elementAt(index);
            final isSelected = state.statusFilter == entry.key;
            return FilterChip(
              label: Text(entry.value),
              selected: isSelected,
              onSelected: (_) =>
                  context.read<OtListCubit>().updateStatusFilter(entry.key),
              selectedColor: AppColors.primary.withValues(alpha: 0.15),
              checkmarkColor: AppColors.primary,
              backgroundColor: AppColors.bgCard,
              side: BorderSide(
                color: isSelected ? AppColors.primary : AppColors.bgSurface,
              ),
              labelStyle: AppTextStyles.caption.copyWith(
                color: isSelected ? AppColors.primary : AppColors.textSecondary,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20.r),
              ),
              padding: EdgeInsets.symmetric(horizontal: 4.w),
              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              visualDensity: VisualDensity.compact,
            );
          },
        ),
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
