import 'package:dartz/dartz.dart';
import 'package:exn_hr/features/notifications/domain/entities/app_notification.dart';
import 'package:exn_hr/features/notifications/domain/repositories/notifications_repository.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

class GetNotificationsUseCase {
  GetNotificationsUseCase(this._repository);
  final NotificationsRepository _repository;

  Future<Either<ApiError, List<AppNotification>>> call({
    int page = 1,
    int size = 20,
  }) {
    return _repository.getNotifications(page: page, size: size);
  }
}
