import 'package:dartz/dartz.dart';
import 'package:exn_hr/features/attendance/domain/entities/attendance_record.dart';
import 'package:exn_hr/features/attendance/domain/repositories/attendance_repository.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

class GetAttendanceHistoryUseCase {
  GetAttendanceHistoryUseCase(this._repository);

  final AttendanceRepository _repository;

  Future<Either<ApiError, List<AttendanceRecord>>> call({
    int page = 1,
    int size = 20,
    String? startDate,
    String? endDate,
  }) {
    return _repository.getHistory(
      page: page,
      size: size,
      startDate: startDate,
      endDate: endDate,
    );
  }
}
