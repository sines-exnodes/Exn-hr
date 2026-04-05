import 'package:dartz/dartz.dart';
import 'package:exn_hr/features/announcements/domain/entities/announcement.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

abstract class AnnouncementsRepository {
  Future<Either<ApiError, List<Announcement>>> getMyAnnouncements({
    int page = 1,
    int size = 15,
  });
  Future<Either<ApiError, Poll>> votePoll({
    required int pollId,
    required List<int> optionIds,
  });
  Future<Either<ApiError, Poll>> getPollResults(int pollId);
}
