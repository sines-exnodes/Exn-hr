import 'package:dartz/dartz.dart';
import 'package:exn_hr/features/leave/domain/entities/leave_request.dart';
import 'package:exn_hr/features/leave/domain/repositories/leave_repository.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

class ApproveLeaveUseCase {
  ApproveLeaveUseCase(this._repository);
  final LeaveRepository _repository;

  Future<Either<ApiError, LeaveRequest>> call(int id, {required String status, String? comment}) {
    return _repository.leaderApprove(id, status: status, comment: comment);
  }

  Future<Either<ApiError, void>> cancel(int id) {
    return _repository.cancelRequest(id);
  }
}
