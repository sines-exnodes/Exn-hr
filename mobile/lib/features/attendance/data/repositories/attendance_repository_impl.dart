import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import 'package:exn_hr/core/network/api/api_client.dart';
import 'package:exn_hr/core/network/api/api_endpoints.dart';
import 'package:exn_hr/features/attendance/data/mappers/attendance_mapper.dart';
import 'package:exn_hr/features/attendance/data/models/attendance_model.dart';
import 'package:exn_hr/features/attendance/domain/entities/attendance_record.dart';
import 'package:exn_hr/features/attendance/domain/repositories/attendance_repository.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

class AttendanceRepositoryImpl implements AttendanceRepository {
  AttendanceRepositoryImpl({required ApiClient apiClient}) : _apiClient = apiClient;

  final ApiClient _apiClient;

  @override
  Future<Either<ApiError, AttendanceRecord>> checkIn({
    double? latitude,
    double? longitude,
    String? wifiSsid,
  }) async {
    try {
      final response = await _apiClient.post(
        ApiEndpoints.checkIn,
        data: {
          if (latitude != null) 'latitude': latitude,
          if (longitude != null) 'longitude': longitude,
          if (wifiSsid != null) 'wifi_ssid': wifiSsid,
        },
      );
      final data = (response.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
      final model = AttendanceModel.fromJson(data);
      return Right(model.toEntity());
    } on DioException catch (e) {
      return Left(ApiError.fromDioError(e));
    } catch (e) {
      return Left(ApiError.unknown());
    }
  }

  @override
  Future<Either<ApiError, AttendanceRecord>> checkOut({
    double? latitude,
    double? longitude,
  }) async {
    try {
      final response = await _apiClient.post(
        ApiEndpoints.checkOut,
        data: {
          if (latitude != null) 'latitude': latitude,
          if (longitude != null) 'longitude': longitude,
        },
      );
      final data = (response.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
      final model = AttendanceModel.fromJson(data);
      return Right(model.toEntity());
    } on DioException catch (e) {
      return Left(ApiError.fromDioError(e));
    } catch (e) {
      return Left(ApiError.unknown());
    }
  }

  @override
  Future<Either<ApiError, List<AttendanceRecord>>> getHistory({
    int page = 1,
    int size = 20,
    String? startDate,
    String? endDate,
  }) async {
    try {
      final response = await _apiClient.get(
        ApiEndpoints.attendanceHistory,
        queryParameters: {
          'page': page,
          'size': size,
          if (startDate != null) 'start_date': startDate,
          if (endDate != null) 'end_date': endDate,
        },
      );
      final responseData = response.data as Map<String, dynamic>;
      final items = (responseData['data'] as List<dynamic>? ?? [])
          .map((e) => AttendanceModel.fromJson(e as Map<String, dynamic>).toEntity())
          .toList();
      return Right(items);
    } on DioException catch (e) {
      return Left(ApiError.fromDioError(e));
    } catch (e) {
      return Left(ApiError.unknown());
    }
  }
}
