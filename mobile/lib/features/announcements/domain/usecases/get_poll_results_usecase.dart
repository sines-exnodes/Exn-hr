import 'package:dartz/dartz.dart';
import 'package:exn_hr/features/announcements/domain/entities/announcement.dart';
import 'package:exn_hr/features/announcements/domain/repositories/announcements_repository.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

class GetPollResultsUseCase {
  GetPollResultsUseCase(this._repository);
  final AnnouncementsRepository _repository;

  Future<Either<ApiError, Poll>> call(int pollId) {
    return _repository.getPollResults(pollId);
  }
}
