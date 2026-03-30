import 'package:dartz/dartz.dart';
import 'package:exn_hr/features/overtime/domain/entities/ot_request.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

abstract class OvertimeRepository {
  Future<Either<ApiError, OtRequest>> createRequest({required String date, required String startTime, required String endTime, required double hours, required String otType, required String reason});
  Future<Either<ApiError, List<OtRequest>>> getList({int page = 1, int size = 20, String? status, int? month, int? year});
  Future<Either<ApiError, void>> cancelRequest(int id);
  Future<Either<ApiError, OtRequest>> leaderApprove(int id, {required String status, String? comment});
  Future<Either<ApiError, OtRequest>> ceoApprove(int id, {required String status, String? comment});
}
