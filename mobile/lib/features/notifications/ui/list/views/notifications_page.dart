import 'package:exn_hr/config/di.dart';
import 'package:exn_hr/core/themes/app_colors.dart';
import 'package:exn_hr/core/themes/app_text_styles.dart';
import 'package:exn_hr/features/notifications/domain/entities/app_notification.dart';
import 'package:exn_hr/features/notifications/ui/list/view_models/notifications_cubit.dart';
import 'package:exn_hr/features/notifications/ui/list/view_models/notifications_state.dart';
import 'package:exn_hr/core/widgets/animations/animations.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';

class NotificationsPage extends StatelessWidget {
  const NotificationsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<NotificationsCubit>(),
      child: const _NotificationsView(),
    );
  }
}

class _NotificationsView extends StatefulWidget {
  const _NotificationsView();

  @override
  State<_NotificationsView> createState() => _NotificationsViewState();
}

class _NotificationsViewState extends State<_NotificationsView> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      context.read<NotificationsCubit>().loadNextPage();
    }
  }

  Color _iconColor(String type) {
    switch (type) {
      case 'leave_approved':
        return AppColors.success;
      case 'leave_rejected':
        return AppColors.error;
      case 'ot_approved':
        return AppColors.success;
      case 'ot_rejected':
        return AppColors.error;
      case 'attendance':
        return AppColors.info;
      case 'salary':
        return AppColors.primary;
      default:
        return AppColors.info;
    }
  }

  IconData _icon(String type) {
    switch (type) {
      case 'leave_approved':
      case 'leave_rejected':
        return Icons.beach_access_rounded;
      case 'ot_approved':
      case 'ot_rejected':
        return Icons.more_time_rounded;
      case 'attendance':
        return Icons.login_rounded;
      case 'salary':
        return Icons.receipt_long_rounded;
      default:
        return Icons.notifications_rounded;
    }
  }

  String _formatTime(String? createdAt) {
    if (createdAt == null) return '';
    try {
      final dt = DateTime.parse(createdAt);
      final now = DateTime.now();
      final diff = now.difference(dt);
      if (diff.inMinutes < 60) return '${diff.inMinutes} phút trước';
      if (diff.inHours < 24) return '${diff.inHours} giờ trước';
      if (diff.inDays < 7) return '${diff.inDays} ngày trước';
      return '${dt.day}/${dt.month}/${dt.year}';
    } catch (_) {
      return createdAt;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgPage,
      appBar: AppBar(
        title: const Text('Thông báo'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: BlocBuilder<NotificationsCubit, NotificationsState>(
        builder: (context, state) {
          if (state.status == NotificationsStatus.loading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state.status == NotificationsStatus.failure) {
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
                      child: Icon(Icons.error_outline, size: 32.sp, color: AppColors.error),
                    ),
                    SizedBox(height: 16.w),
                    Text(
                      state.errorMessage ?? 'Không tải được thông báo',
                      style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600),
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: 16.w),
                    TextButton.icon(
                      onPressed: () =>
                          context.read<NotificationsCubit>().loadNotifications(),
                      icon: const Icon(Icons.refresh_rounded),
                      label: const Text('Thử lại'),
                    ),
                  ],
                ),
              ),
            );
          }
          if (state.notifications.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 64.w,
                    height: 64.w,
                    decoration: BoxDecoration(
                      color: AppColors.infoBg,
                      borderRadius: BorderRadius.circular(20.r),
                    ),
                    child: Icon(Icons.notifications_off_outlined, size: 32.sp, color: AppColors.info),
                  ),
                  SizedBox(height: 16.w),
                  Text('Chưa có thông báo', style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600)),
                  SizedBox(height: 4.w),
                  Text('Các thông báo sẽ hiển thị tại đây', style: AppTextStyles.caption),
                ],
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () =>
                context.read<NotificationsCubit>().loadNotifications(),
            color: AppColors.primary,
            child: ListView.builder(
              controller: _scrollController,
              padding: EdgeInsets.all(16.w),
              itemCount: state.notifications.length + (state.isPaginating ? 1 : 0),
              itemBuilder: (context, index) {
                if (index >= state.notifications.length) {
                  return Padding(
                    padding: EdgeInsets.symmetric(vertical: 16.w),
                    child: const Center(child: CircularProgressIndicator()),
                  );
                }
                final notification = state.notifications[index];
                return AnimatedListItem(
                  index: index,
                  child: _buildNotificationTile(context, notification),
                );
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildNotificationTile(BuildContext context, AppNotification notification) {
    final color = _iconColor(notification.type);
    final icon = _icon(notification.type);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {
          context.read<NotificationsCubit>().markAsRead(notification.id);
        },
        borderRadius: BorderRadius.circular(12.r),
        child: Container(
          margin: EdgeInsets.only(bottom: 8.w),
          padding: EdgeInsets.all(14.w),
          decoration: BoxDecoration(
            color: notification.isRead
                ? AppColors.surface
                : AppColors.primary.withValues(alpha: 0.04),
            borderRadius: BorderRadius.circular(12.r),
            border: Border.all(
              color: notification.isRead
                  ? AppColors.border
                  : AppColors.primary.withValues(alpha: 0.2),
            ),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 40.w,
                height: 40.w,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(10.r),
                ),
                child: Icon(icon, color: color, size: 20.sp),
              ),
              SizedBox(width: 12.w),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            notification.title,
                            style: AppTextStyles.labelMedium.copyWith(
                              fontWeight: notification.isRead
                                  ? FontWeight.w500
                                  : FontWeight.w600,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Text(
                          _formatTime(notification.createdAt),
                          style: AppTextStyles.caption,
                        ),
                      ],
                    ),
                    SizedBox(height: 4.w),
                    Text(
                      notification.body,
                      style: AppTextStyles.bodySmall,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              if (!notification.isRead) ...[
                SizedBox(width: 8.w),
                Container(
                  width: 8.w,
                  height: 8.w,
                  decoration: const BoxDecoration(
                    color: AppColors.primary,
                    shape: BoxShape.circle,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
