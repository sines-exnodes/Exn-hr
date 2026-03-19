import 'package:dartz/dartz.dart';
import 'package:exn_hr/features/attendance/domain/entities/attendance_record.dart';
import 'package:exn_hr/features/attendance/domain/repositories/attendance_repository.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

class CheckInUseCase {
  CheckInUseCase(this._repository);

  final AttendanceRepository _repository;

  Future<Either<ApiError, AttendanceRecord>> call({
    double? latitude,
    double? longitude,
    String? wifiSsid,
  }) {
    return _repository.checkIn(
      latitude: latitude,
      longitude: longitude,
      wifiSsid: wifiSsid,
    );
  }
}
