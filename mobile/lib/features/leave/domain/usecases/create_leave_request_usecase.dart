import 'package:dartz/dartz.dart';
import 'package:exn_hr/features/leave/domain/entities/leave_request.dart';
import 'package:exn_hr/features/leave/domain/repositories/leave_repository.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

class CreateLeaveRequestUseCase {
  CreateLeaveRequestUseCase(this._repository);
  final LeaveRepository _repository;

  Future<Either<ApiError, LeaveRequest>> call({required String type, required String startDate, required String endDate, required double days, required String reason}) {
    return _repository.createRequest(type: type, startDate: startDate, endDate: endDate, days: days, reason: reason);
  }
}
