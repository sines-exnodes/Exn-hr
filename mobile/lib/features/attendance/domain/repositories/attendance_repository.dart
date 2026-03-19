import 'package:dartz/dartz.dart';
import 'package:exn_hr/features/attendance/domain/entities/attendance_record.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

abstract class AttendanceRepository {
  Future<Either<ApiError, AttendanceRecord>> checkIn({
    double? latitude,
    double? longitude,
    String? wifiSsid,
  });

  Future<Either<ApiError, AttendanceRecord>> checkOut({
    double? latitude,
    double? longitude,
  });

  Future<Either<ApiError, List<AttendanceRecord>>> getHistory({
    int page = 1,
    int size = 20,
    String? startDate,
    String? endDate,
  });
}
