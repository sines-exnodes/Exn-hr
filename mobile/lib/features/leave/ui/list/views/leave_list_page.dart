import 'package:exn_hr/config/di.dart';
import 'package:exn_hr/core/routing/app_router.dart';
import 'package:exn_hr/core/themes/app_colors.dart';
import 'package:exn_hr/core/themes/app_text_styles.dart';
import 'package:exn_hr/core/utils/date_utils.dart';
import 'package:exn_hr/core/widgets/animations/animations.dart';
import 'package:exn_hr/features/leave/domain/entities/leave_request.dart';
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

class _LeaveListView extends StatefulWidget {
  const _LeaveListView();

  @override
  State<_LeaveListView> createState() => _LeaveListViewState();
}

class _LeaveListViewState extends State<_LeaveListView> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      context.read<LeaveListCubit>().loadNextPage();
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  static const _leaveTypeLabels = {
    'annual': 'Phép năm',
    'sick': 'Ốm đau',
    'personal': 'Việc riêng',
    'unpaid': 'Không lương',
    'paid': 'Có lương',
  };

  static const _filterOptions = <String, String>{
    '': 'Tất cả',
    'pending': 'Chờ duyệt',
    'approved': 'Đã duyệt',
    'rejected': 'Từ chối',
  };

  String _leaveTypeLabel(String type) {
    return _leaveTypeLabels[type.toLowerCase()] ?? type;
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
        title: const Text('Đơn nghỉ phép'),
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
            final created = await context.push<bool>(AppRoutes.leaveRequest);
            if (created == true && context.mounted) {
              context.read<LeaveListCubit>().loadList();
            }
          },
          backgroundColor: AppColors.primary,
          elevation: 4,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16.r)),
          child: const Icon(Icons.add, color: Colors.white),
        ),
      ),
      body: BlocBuilder<LeaveListCubit, LeaveListState>(
        builder: (context, state) {
          if (state.status == LeaveListStatus.loading) {
            return const Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            );
          }
          if (state.status == LeaveListStatus.failure) {
            return _buildError(context, state.errorMessage);
          }
          if (state.requests.isEmpty) {
            return _buildEmpty();
          }
          final filtered = state.filteredRequests;
          final headerCount = (state.balance != null ? 1 : 0) + 1;
          final itemCount = filtered.length + headerCount + (state.isPaginating ? 1 : 0);
          return RefreshIndicator(
            onRefresh: () => context.read<LeaveListCubit>().loadList(),
            color: AppColors.primary,
            child: ListView.builder(
              controller: _scrollController,
              padding: EdgeInsets.all(16.w),
              itemCount: itemCount,
              itemBuilder: (context, index) {
                if (state.balance != null && index == 0) {
                  return _buildBalanceCard(state.balance!);
                }
                final filterChipIndex = state.balance != null ? 1 : 0;
                if (index == filterChipIndex) {
                  return _buildFilterChips(context, state);
                }
                // Pagination loading indicator at the bottom
                if (index == filtered.length + headerCount) {
                  return Padding(
                    padding: EdgeInsets.symmetric(vertical: 16.w),
                    child: const Center(
                      child: CircularProgressIndicator(),
                    ),
                  );
                }
                final requestIndex = index - headerCount;
                final request = filtered[requestIndex];
                return AnimatedListItem(
                  index: requestIndex,
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
                              color: _statusAccentColor(request.overallStatus),
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
                                                color: AppColors.accentPurpleBg,
                                                borderRadius:
                                                    BorderRadius.circular(8.r),
                                              ),
                                              child: Icon(
                                                Icons.beach_access_rounded,
                                                color: AppColors.accentPurple,
                                                size: 16.sp,
                                              ),
                                            ),
                                            SizedBox(width: 10.w),
                                            Text(
                                              _leaveTypeLabel(request.type),
                                              style: AppTextStyles.labelLarge,
                                            ),
                                          ],
                                        ),
                                        AppBadge(
                                          label: request.overallStatus,
                                          status: _badgeStatus(
                                              request.overallStatus),
                                        ),
                                      ],
                                    ),
                                    SizedBox(height: 12.w),
                                    Row(
                                      children: [
                                        Icon(Icons.calendar_today_rounded,
                                            size: 14.sp,
                                            color: AppColors.textSecondary),
                                        SizedBox(width: 6.w),
                                        Text(
                                          '${formatDateDisplay(request.startDate)} — ${formatDateDisplay(request.endDate)}',
                                          style: AppTextStyles.bodySmall,
                                        ),
                                        SizedBox(width: 12.w),
                                        Container(
                                          padding: EdgeInsets.symmetric(
                                              horizontal: 8.w, vertical: 2.w),
                                          decoration: BoxDecoration(
                                            color: AppColors.bgSurface,
                                            borderRadius:
                                                BorderRadius.circular(6.r),
                                          ),
                                          child: Text(
                                            '${request.days} ngày',
                                            style: AppTextStyles.caption
                                                .copyWith(
                                                    fontWeight: FontWeight.w600),
                                          ),
                                        ),
                                      ],
                                    ),
                                    SizedBox(height: 6.w),
                                    Text(
                                      request.reason,
                                      style: AppTextStyles.caption,
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
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

  Widget _buildFilterChips(BuildContext context, LeaveListState state) {
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
                  context.read<LeaveListCubit>().updateStatusFilter(entry.key),
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

  Widget _buildBalanceCard(LeaveBalance balance) {
    final usageRatio = balance.totalDays > 0
        ? balance.usedDays / balance.totalDays
        : 0.0;
    return Container(
      margin: EdgeInsets.only(bottom: 16.w),
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.gradientStart, AppColors.gradientEnd],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Phép năm còn lại: ${balance.remainingDays.toStringAsFixed(balance.remainingDays.truncateToDouble() == balance.remainingDays ? 0 : 1)}/${balance.totalDays} ngày',
            style: AppTextStyles.labelLarge.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w700,
            ),
          ),
          SizedBox(height: 16.w),
          Row(
            children: [
              _buildStatColumn('Tổng phép', '${balance.totalDays}'),
              Container(
                width: 1,
                height: 32.w,
                color: Colors.white.withValues(alpha: 0.3),
              ),
              _buildStatColumn(
                'Đã dùng',
                balance.usedDays.toStringAsFixed(
                    balance.usedDays.truncateToDouble() == balance.usedDays
                        ? 0
                        : 1),
              ),
              Container(
                width: 1,
                height: 32.w,
                color: Colors.white.withValues(alpha: 0.3),
              ),
              _buildStatColumn(
                'Còn lại',
                balance.remainingDays.toStringAsFixed(
                    balance.remainingDays.truncateToDouble() ==
                            balance.remainingDays
                        ? 0
                        : 1),
              ),
            ],
          ),
          SizedBox(height: 12.w),
          ClipRRect(
            borderRadius: BorderRadius.circular(4.r),
            child: LinearProgressIndicator(
              value: usageRatio.clamp(0.0, 1.0),
              minHeight: 6.w,
              backgroundColor: Colors.white.withValues(alpha: 0.3),
              valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatColumn(String label, String value) {
    return Expanded(
      child: Column(
        children: [
          Text(
            value,
            style: AppTextStyles.h3.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w700,
            ),
          ),
          SizedBox(height: 2.w),
          Text(
            label,
            style: AppTextStyles.caption.copyWith(
              color: Colors.white.withValues(alpha: 0.8),
            ),
          ),
        ],
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
              color: AppColors.accentPurpleBg,
              borderRadius: BorderRadius.circular(20.r),
            ),
            child: Icon(Icons.beach_access_rounded,
                size: 32.sp, color: AppColors.accentPurple),
          ),
          SizedBox(height: 16.w),
          Text('Chưa có đơn nghỉ phép',
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
              onPressed: () => context.read<LeaveListCubit>().loadList(),
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
