import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import 'package:exn_hr/core/network/api/api_client.dart';
import 'package:exn_hr/core/network/api/api_endpoints.dart';
import 'package:exn_hr/features/overtime/data/mappers/ot_mapper.dart';
import 'package:exn_hr/features/overtime/data/models/ot_model.dart';
import 'package:exn_hr/features/overtime/domain/entities/ot_request.dart';
import 'package:exn_hr/features/overtime/domain/repositories/overtime_repository.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

class OvertimeRepositoryImpl implements OvertimeRepository {
  OvertimeRepositoryImpl({required ApiClient apiClient}) : _apiClient = apiClient;
  final ApiClient _apiClient;

  @override
  Future<Either<ApiError, OtRequest>> createRequest({required String date, required String startTime, required String endTime, required double hours, required String reason}) async {
    try {
      final response = await _apiClient.post(ApiEndpoints.overtime, data: {'date': date, 'start_time': startTime, 'end_time': endTime, 'hours': hours, 'reason': reason});
      final data = (response.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
      return Right(OtModel.fromJson(data).toEntity());
    } on DioException catch (e) { return Left(ApiError.fromDioError(e)); } catch (e) { return Left(ApiError.unknown()); }
  }

  @override
  Future<Either<ApiError, List<OtRequest>>> getList({int page = 1, int size = 20, String? status, int? month, int? year}) async {
    try {
      final qp = <String, dynamic>{'page': page, 'size': size};
      if (status != null) qp['status'] = status;
      if (month != null) qp['month'] = month;
      if (year != null) qp['year'] = year;
      final response = await _apiClient.get(ApiEndpoints.overtime, queryParameters: qp);
      final items = ((response.data as Map<String, dynamic>)['data'] as List<dynamic>? ?? []).map((e) => OtModel.fromJson(e as Map<String, dynamic>).toEntity()).toList();
      return Right(items);
    } on DioException catch (e) { return Left(ApiError.fromDioError(e)); } catch (e) { return Left(ApiError.unknown()); }
  }

  @override
  Future<Either<ApiError, void>> cancelRequest(int id) async {
    try {
      await _apiClient.delete(ApiEndpoints.overtimeById(id));
      return const Right(null);
    } on DioException catch (e) { return Left(ApiError.fromDioError(e)); } catch (e) { return Left(ApiError.unknown()); }
  }
}
