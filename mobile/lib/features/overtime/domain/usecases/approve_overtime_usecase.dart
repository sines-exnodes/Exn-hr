import 'package:dartz/dartz.dart';
import 'package:exn_hr/features/overtime/domain/entities/ot_request.dart';
import 'package:exn_hr/features/overtime/domain/repositories/overtime_repository.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

class ApproveOvertimeUseCase {
  ApproveOvertimeUseCase(this._repository);
  final OvertimeRepository _repository;

  Future<Either<ApiError, OtRequest>> leaderApprove(int id,
          {required String status, String? comment}) =>
      _repository.leaderApprove(id, status: status, comment: comment);

  Future<Either<ApiError, OtRequest>> ceoApprove(int id,
          {required String status, String? comment}) =>
      _repository.ceoApprove(id, status: status, comment: comment);
}
