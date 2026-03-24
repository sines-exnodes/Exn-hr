import 'package:dartz/dartz.dart';
import 'package:exn_hr/features/leave/domain/entities/leave_request.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

abstract class LeaveRepository {
  Future<Either<ApiError, LeaveRequest>> createRequest({required String type, required String startDate, required String endDate, required double days, required String reason});
  Future<Either<ApiError, List<LeaveRequest>>> getList({int page = 1, int size = 20, String? status, String? type, int? year});
  Future<Either<ApiError, LeaveBalance>> getBalance({int? year});
  Future<Either<ApiError, LeaveRequest>> leaderApprove(int id, {required String status, String? comment});
  Future<Either<ApiError, void>> cancelRequest(int id);
}
