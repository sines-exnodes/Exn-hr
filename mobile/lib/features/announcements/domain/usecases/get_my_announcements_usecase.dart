import 'package:dartz/dartz.dart';
import 'package:exn_hr/features/announcements/domain/entities/announcement.dart';
import 'package:exn_hr/features/announcements/domain/repositories/announcements_repository.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

class GetMyAnnouncementsUseCase {
  GetMyAnnouncementsUseCase(this._repository);
  final AnnouncementsRepository _repository;

  Future<Either<ApiError, List<Announcement>>> call() {
    return _repository.getMyAnnouncements();
  }
}
