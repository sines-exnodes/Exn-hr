import 'package:dartz/dartz.dart';
import 'package:exn_hr/features/overtime/domain/entities/ot_request.dart';
import 'package:exn_hr/features/overtime/domain/repositories/overtime_repository.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

class GetOtListUseCase {
  GetOtListUseCase(this._repository);
  final OvertimeRepository _repository;

  Future<Either<ApiError, List<OtRequest>>> call({int page = 1, int size = 20, String? status, int? month, int? year}) {
    return _repository.getList(page: page, size: size, status: status, month: month, year: year);
  }

  Future<Either<ApiError, void>> cancel(int id) {
    return _repository.cancelRequest(id);
  }
}
