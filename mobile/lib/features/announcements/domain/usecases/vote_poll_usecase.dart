import 'package:dartz/dartz.dart';
import 'package:exn_hr/features/announcements/domain/entities/announcement.dart';
import 'package:exn_hr/features/announcements/domain/repositories/announcements_repository.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

class VotePollUseCase {
  VotePollUseCase(this._repository);
  final AnnouncementsRepository _repository;

  Future<Either<ApiError, Poll>> call({
    required int pollId,
    required List<int> optionIds,
  }) {
    return _repository.votePoll(pollId: pollId, optionIds: optionIds);
  }
}
