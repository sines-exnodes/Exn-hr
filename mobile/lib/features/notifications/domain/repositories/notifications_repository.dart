import 'package:dartz/dartz.dart';
import 'package:exn_hr/features/notifications/domain/entities/app_notification.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

abstract class NotificationsRepository {
  Future<Either<ApiError, List<AppNotification>>> getNotifications({
    int page = 1,
    int size = 20,
  });

  Future<Either<ApiError, void>> markAsRead(String id);
}
