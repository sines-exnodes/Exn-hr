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
  Future<Either<ApiError, AttendanceRecord>> checkIn({required double latitude, required double longitude, String? wifiSsid}) async {
    try {
      final data = <String, dynamic>{'latitude': latitude, 'longitude': longitude};
      if (wifiSsid != null) data['wifi_ssid'] = wifiSsid;
      final response = await _apiClient.post(ApiEndpoints.checkIn, data: data);
      final d = (response.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
      return Right(AttendanceModel.fromJson(d).toEntity());
    } on DioException catch (e) { return Left(ApiError.fromDioError(e)); } catch (e) { return Left(ApiError.unknown()); }
  }

  @override
  Future<Either<ApiError, AttendanceRecord>> checkOut({required double latitude, required double longitude, String? wifiSsid}) async {
    try {
      final data = <String, dynamic>{'latitude': latitude, 'longitude': longitude};
      if (wifiSsid != null) data['wifi_ssid'] = wifiSsid;
      final response = await _apiClient.post(ApiEndpoints.checkOut, data: data);
      final d = (response.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
      return Right(AttendanceModel.fromJson(d).toEntity());
    } on DioException catch (e) { return Left(ApiError.fromDioError(e)); } catch (e) { return Left(ApiError.unknown()); }
  }

  @override
  Future<Either<ApiError, AttendanceRecord?>> getToday() async {
    try {
      final response = await _apiClient.get(ApiEndpoints.attendanceToday);
      final responseData = response.data as Map<String, dynamic>;
      if (responseData['data'] == null) return const Right(null);
      return Right(AttendanceModel.fromJson(responseData['data'] as Map<String, dynamic>).toEntity());
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) return const Right(null);
      return Left(ApiError.fromDioError(e));
    } catch (e) { return Left(ApiError.unknown()); }
  }

  @override
  Future<Either<ApiError, List<AttendanceRecord>>> getHistory({int page = 1, int size = 20, String? startDate, String? endDate}) async {
    try {
      final qp = <String, dynamic>{'page': page, 'size': size};
      if (startDate != null) qp['start_date'] = startDate;
      if (endDate != null) qp['end_date'] = endDate;
      final response = await _apiClient.get(ApiEndpoints.attendance, queryParameters: qp);
      final items = ((response.data as Map<String, dynamic>)['data'] as List<dynamic>? ?? []).map((e) => AttendanceModel.fromJson(e as Map<String, dynamic>).toEntity()).toList();
      return Right(items);
    } on DioException catch (e) { return Left(ApiError.fromDioError(e)); } catch (e) { return Left(ApiError.unknown()); }
  }
}
