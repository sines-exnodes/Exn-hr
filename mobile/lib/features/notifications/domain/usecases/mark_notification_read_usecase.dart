import 'package:dartz/dartz.dart';
import 'package:exn_hr/features/notifications/domain/repositories/notifications_repository.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

class MarkNotificationReadUseCase {
  MarkNotificationReadUseCase(this._repository);
  final NotificationsRepository _repository;

  Future<Either<ApiError, void>> call(int id) => _repository.markAsRead(id);
}
