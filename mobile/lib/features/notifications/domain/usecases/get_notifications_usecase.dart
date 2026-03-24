import 'package:dartz/dartz.dart';
import 'package:exn_hr/features/notifications/domain/entities/app_notification.dart';
import 'package:exn_hr/features/notifications/domain/repositories/notifications_repository.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

class GetNotificationsUseCase {
  GetNotificationsUseCase(this._repository);
  final NotificationsRepository _repository;

  Future<Either<ApiError, List<AppNotification>>> call({int page = 1, int size = 20, String? type, bool? isRead}) {
    return _repository.getNotifications(page: page, size: size, type: type, isRead: isRead);
  }

  Future<Either<ApiError, int>> getUnreadCount() {
    return _repository.getUnreadCount();
  }

  Future<Either<ApiError, void>> markAsRead(int id) {
    return _repository.markAsRead(id);
  }

  Future<Either<ApiError, void>> markAllAsRead() {
    return _repository.markAllAsRead();
  }
}
