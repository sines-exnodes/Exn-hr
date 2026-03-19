import 'package:dartz/dartz.dart';
import 'package:exn_hr/features/leave/domain/entities/leave_request.dart';
import 'package:exn_hr/features/leave/domain/repositories/leave_repository.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

class GetLeaveListUseCase {
  GetLeaveListUseCase(this._repository);
  final LeaveRepository _repository;

  Future<Either<ApiError, List<LeaveRequest>>> call({
    int page = 1,
    int size = 20,
    String? status,
  }) {
    return _repository.getList(page: page, size: size, status: status);
  }
}
