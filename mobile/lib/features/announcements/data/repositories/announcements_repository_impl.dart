import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import 'package:exn_hr/core/network/api/api_client.dart';
import 'package:exn_hr/core/network/api/api_endpoints.dart';
import 'package:exn_hr/features/announcements/data/mappers/announcement_mapper.dart';
import 'package:exn_hr/features/announcements/data/models/announcement_model.dart';
import 'package:exn_hr/features/announcements/domain/entities/announcement.dart';
import 'package:exn_hr/features/announcements/domain/repositories/announcements_repository.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

class AnnouncementsRepositoryImpl implements AnnouncementsRepository {
  AnnouncementsRepositoryImpl({required ApiClient apiClient})
      : _apiClient = apiClient;
  final ApiClient _apiClient;

  @override
  Future<Either<ApiError, List<Announcement>>> getMyAnnouncements() async {
    try {
      final response = await _apiClient.get(ApiEndpoints.myAnnouncements);
      final items =
          ((response.data as Map<String, dynamic>)['data'] as List<dynamic>? ??
                  [])
              .map((e) => AnnouncementModel.fromJson(e as Map<String, dynamic>)
                  .toEntity())
              .toList();
      return Right(items);
    } on DioException catch (e) {
      return Left(ApiError.fromDioError(e));
    } catch (e) {
      return Left(ApiError.unknown());
    }
  }

  @override
  Future<Either<ApiError, Poll>> votePoll({
    required int pollId,
    required List<int> optionIds,
  }) async {
    try {
      final response = await _apiClient.post(
        ApiEndpoints.pollVote(pollId),
        data: {'option_ids': optionIds},
      );
      final data =
          (response.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
      return Right(PollModel.fromJson(data).toEntity());
    } on DioException catch (e) {
      return Left(ApiError.fromDioError(e));
    } catch (e) {
      return Left(ApiError.unknown());
    }
  }

  @override
  Future<Either<ApiError, Poll>> getPollResults(int pollId) async {
    try {
      final response =
          await _apiClient.get(ApiEndpoints.pollResults(pollId));
      final data =
          (response.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
      return Right(PollModel.fromJson(data).toEntity());
    } on DioException catch (e) {
      return Left(ApiError.fromDioError(e));
    } catch (e) {
      return Left(ApiError.unknown());
    }
  }
}
