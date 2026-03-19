import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import 'package:exn_hr/core/network/api/api_client.dart';
import 'package:exn_hr/core/network/api/api_endpoints.dart';
import 'package:exn_hr/features/leave/data/mappers/leave_mapper.dart';
import 'package:exn_hr/features/leave/data/models/leave_model.dart';
import 'package:exn_hr/features/leave/domain/entities/leave_request.dart';
import 'package:exn_hr/features/leave/domain/repositories/leave_repository.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

class LeaveRepositoryImpl implements LeaveRepository {
  LeaveRepositoryImpl({required ApiClient apiClient}) : _apiClient = apiClient;

  final ApiClient _apiClient;

  @override
  Future<Either<ApiError, LeaveRequest>> createRequest({
    required String type,
    required String startDate,
    required String endDate,
    required String reason,
  }) async {
    try {
      final response = await _apiClient.post(
        ApiEndpoints.leaveRequests,
        data: {'type': type, 'start_date': startDate, 'end_date': endDate, 'reason': reason},
      );
      final data = (response.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
      return Right(LeaveModel.fromJson(data).toEntity());
    } on DioException catch (e) {
      return Left(ApiError.fromDioError(e));
    } catch (e) {
      return Left(ApiError.unknown());
    }
  }

  @override
  Future<Either<ApiError, List<LeaveRequest>>> getList({
    int page = 1,
    int size = 20,
    String? status,
  }) async {
    try {
      final response = await _apiClient.get(
        ApiEndpoints.leaveRequests,
        queryParameters: {
          'page': page,
          'size': size,
          if (status != null) 'status': status,
        },
      );
      final items = ((response.data as Map<String, dynamic>)['data'] as List<dynamic>? ?? [])
          .map((e) => LeaveModel.fromJson(e as Map<String, dynamic>).toEntity())
          .toList();
      return Right(items);
    } on DioException catch (e) {
      return Left(ApiError.fromDioError(e));
    } catch (e) {
      return Left(ApiError.unknown());
    }
  }

  @override
  Future<Either<ApiError, LeaveRequest>> approve(String id) async {
    try {
      final response = await _apiClient.post(ApiEndpoints.approveLeave(id));
      final data = (response.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
      return Right(LeaveModel.fromJson(data).toEntity());
    } on DioException catch (e) {
      return Left(ApiError.fromDioError(e));
    } catch (e) {
      return Left(ApiError.unknown());
    }
  }

  @override
  Future<Either<ApiError, LeaveRequest>> reject(String id, {String? reason}) async {
    try {
      final response = await _apiClient.post(
        ApiEndpoints.rejectLeave(id),
        data: reason != null ? {'reason': reason} : null,
      );
      final data = (response.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
      return Right(LeaveModel.fromJson(data).toEntity());
    } on DioException catch (e) {
      return Left(ApiError.fromDioError(e));
    } catch (e) {
      return Left(ApiError.unknown());
    }
  }
}
