import 'package:exn_hr/features/notifications/domain/usecases/get_notifications_usecase.dart';
import 'package:exn_hr/features/notifications/domain/usecases/mark_notification_read_usecase.dart';
import 'package:exn_hr/features/notifications/ui/list/view_models/notifications_state.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class NotificationsCubit extends Cubit<NotificationsState> {
  NotificationsCubit({
    required GetNotificationsUseCase getNotificationsUseCase,
    required MarkNotificationReadUseCase markNotificationReadUseCase,
  })  : _getNotificationsUseCase = getNotificationsUseCase,
        _markNotificationReadUseCase = markNotificationReadUseCase,
        super(const NotificationsState()) {
    loadNotifications();
  }

  final GetNotificationsUseCase _getNotificationsUseCase;
  final MarkNotificationReadUseCase _markNotificationReadUseCase;

  Future<void> loadNotifications() async {
    emit(state.copyWith(status: NotificationsStatus.loading));
    final result = await _getNotificationsUseCase();
    if (isClosed) return;
    result.fold(
      (error) => emit(state.copyWith(
        status: NotificationsStatus.failure,
        errorMessage: error.message,
      )),
      (notifications) => emit(state.copyWith(
        status: NotificationsStatus.success,
        notifications: notifications,
      )),
    );
  }

  Future<void> markAsRead(int id) async {
    final idx = state.notifications.indexWhere((n) => n.id == id);
    if (idx < 0 || state.notifications[idx].isRead) return;
    final result = await _markNotificationReadUseCase(id);
    if (isClosed) return;
    result.fold((_) {}, (_) {
      final next = [...state.notifications];
      next[idx] = next[idx].copyWith(isRead: true);
      emit(state.copyWith(notifications: next));
    });
  }
}
