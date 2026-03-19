import 'package:exn_hr/features/notifications/domain/usecases/get_notifications_usecase.dart';
import 'package:exn_hr/features/notifications/ui/list/view_models/notifications_state.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class NotificationsCubit extends Cubit<NotificationsState> {
  NotificationsCubit({required GetNotificationsUseCase getNotificationsUseCase})
      : _getNotificationsUseCase = getNotificationsUseCase,
        super(const NotificationsState()) {
    loadNotifications();
  }

  final GetNotificationsUseCase _getNotificationsUseCase;

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
}
