import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import 'package:exn_hr/core/network/api/api_client.dart';
import 'package:exn_hr/core/network/api/api_endpoints.dart';
import 'package:exn_hr/features/projects/data/mappers/project_mapper.dart';
import 'package:exn_hr/features/projects/data/models/project_model.dart';
import 'package:exn_hr/features/projects/domain/entities/project.dart';
import 'package:exn_hr/features/projects/domain/repositories/project_repository.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

class ProjectRepositoryImpl implements ProjectRepository {
  ProjectRepositoryImpl({required ApiClient apiClient}) : _apiClient = apiClient;
  final ApiClient _apiClient;

  @override
  Future<Either<ApiError, List<Project>>> getMyProjects({
    int page = 1,
    int size = 10,
  }) async {
    try {
      final response = await _apiClient.get(
        ApiEndpoints.myProjects,
        queryParameters: {'page': page, 'size': size},
      );
      final items =
          ((response.data as Map<String, dynamic>)['data'] as List<dynamic>? ?? [])
              .map((e) => ProjectModel.fromJson(e as Map<String, dynamic>).toEntity())
              .toList();
      return Right(items);
    } on DioException catch (e) {
      return Left(ApiError.fromDioError(e));
    } catch (e) {
      return Left(ApiError.unknown());
    }
  }

  @override
  Future<Either<ApiError, Project>> getProjectDetail(int id) async {
    try {
      final response = await _apiClient.get(ApiEndpoints.projectById(id));
      final data =
          (response.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
      return Right(ProjectModel.fromJson(data).toEntity());
    } on DioException catch (e) {
      return Left(ApiError.fromDioError(e));
    } catch (e) {
      return Left(ApiError.unknown());
    }
  }

  @override
  Future<Either<ApiError, List<Milestone>>> getUpcomingMilestones(
      {int days = 7}) async {
    try {
      final response = await _apiClient.get(
        ApiEndpoints.upcomingMilestones,
        queryParameters: {'days': days},
      );
      final items =
          ((response.data as Map<String, dynamic>)['data'] as List<dynamic>? ?? [])
              .map((e) =>
                  MilestoneModel.fromJson(e as Map<String, dynamic>).toEntity())
              .toList();
      return Right(items);
    } on DioException catch (e) {
      return Left(ApiError.fromDioError(e));
    } catch (e) {
      return Left(ApiError.unknown());
    }
  }

  @override
  Future<Either<ApiError, void>> toggleMilestoneItem(
      int milestoneId, int itemId) async {
    try {
      await _apiClient.put(
        ApiEndpoints.toggleMilestoneItem(milestoneId, itemId),
      );
      return const Right(null);
    } on DioException catch (e) {
      return Left(ApiError.fromDioError(e));
    } catch (e) {
      return Left(ApiError.unknown());
    }
  }
}
