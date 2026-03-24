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
  Future<Either<ApiError, LeaveRequest>> createRequest({required String type, required String startDate, required String endDate, required double days, required String reason}) async {
    try {
      final response = await _apiClient.post(ApiEndpoints.leave, data: {'type': type, 'start_date': startDate, 'end_date': endDate, 'days': days, 'reason': reason});
      final data = (response.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
      return Right(LeaveModel.fromJson(data).toEntity());
    } on DioException catch (e) { return Left(ApiError.fromDioError(e)); } catch (e) { return Left(ApiError.unknown()); }
  }

  @override
  Future<Either<ApiError, List<LeaveRequest>>> getList({int page = 1, int size = 20, String? status, String? type, int? year}) async {
    try {
      final qp = <String, dynamic>{'page': page, 'size': size};
      if (status != null) qp['status'] = status;
      if (type != null) qp['type'] = type;
      if (year != null) qp['year'] = year;
      final response = await _apiClient.get(ApiEndpoints.leave, queryParameters: qp);
      final items = ((response.data as Map<String, dynamic>)['data'] as List<dynamic>? ?? []).map((e) => LeaveModel.fromJson(e as Map<String, dynamic>).toEntity()).toList();
      return Right(items);
    } on DioException catch (e) { return Left(ApiError.fromDioError(e)); } catch (e) { return Left(ApiError.unknown()); }
  }

  @override
  Future<Either<ApiError, LeaveBalance>> getBalance({int? year}) async {
    try {
      final qp = <String, dynamic>{};
      if (year != null) qp['year'] = year;
      final response = await _apiClient.get(ApiEndpoints.leaveBalance, queryParameters: qp);
      final data = (response.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
      return Right(LeaveBalanceModel.fromJson(data).toEntity());
    } on DioException catch (e) { return Left(ApiError.fromDioError(e)); } catch (e) { return Left(ApiError.unknown()); }
  }

  @override
  Future<Either<ApiError, LeaveRequest>> leaderApprove(int id, {required String status, String? comment}) async {
    try {
      final body = <String, dynamic>{'status': status};
      if (comment != null) body['comment'] = comment;
      final response = await _apiClient.post(ApiEndpoints.leaveLeaderApprove(id), data: body);
      final data = (response.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
      return Right(LeaveModel.fromJson(data).toEntity());
    } on DioException catch (e) { return Left(ApiError.fromDioError(e)); } catch (e) { return Left(ApiError.unknown()); }
  }

  @override
  Future<Either<ApiError, void>> cancelRequest(int id) async {
    try {
      await _apiClient.delete(ApiEndpoints.leaveById(id));
      return const Right(null);
    } on DioException catch (e) { return Left(ApiError.fromDioError(e)); } catch (e) { return Left(ApiError.unknown()); }
  }
}
