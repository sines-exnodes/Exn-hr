import 'package:dartz/dartz.dart';
import 'package:exn_hr/features/overtime/domain/entities/ot_request.dart';
import 'package:exn_hr/features/overtime/domain/repositories/overtime_repository.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

class CreateOtRequestUseCase {
  CreateOtRequestUseCase(this._repository);
  final OvertimeRepository _repository;

  Future<Either<ApiError, OtRequest>> call({
    required String date,
    required String startTime,
    required String endTime,
    required String reason,
  }) {
    return _repository.createRequest(
      date: date,
      startTime: startTime,
      endTime: endTime,
      reason: reason,
    );
  }
}
