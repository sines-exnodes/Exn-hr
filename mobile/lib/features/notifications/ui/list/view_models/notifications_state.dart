import 'package:equatable/equatable.dart';
import 'package:exn_hr/features/notifications/domain/entities/app_notification.dart';

enum NotificationsStatus { initial, loading, success, failure }

class NotificationsState extends Equatable {
  const NotificationsState({
    this.status = NotificationsStatus.initial,
    this.notifications = const [],
    this.errorMessage,
    this.currentPage = 1,
    this.hasMore = true,
    this.isPaginating = false,
  });

  final NotificationsStatus status;
  final List<AppNotification> notifications;
  final String? errorMessage;
  final int currentPage;
  final bool hasMore;
  final bool isPaginating;

  NotificationsState copyWith({
    NotificationsStatus? status,
    List<AppNotification>? notifications,
    String? errorMessage,
    int? currentPage,
    bool? hasMore,
    bool? isPaginating,
  }) {
    return NotificationsState(
      status: status ?? this.status,
      notifications: notifications ?? this.notifications,
      errorMessage: errorMessage ?? this.errorMessage,
      currentPage: currentPage ?? this.currentPage,
      hasMore: hasMore ?? this.hasMore,
      isPaginating: isPaginating ?? this.isPaginating,
    );
  }

  @override
  List<Object?> get props => [status, notifications, errorMessage, currentPage, hasMore, isPaginating];
}
