import 'package:dartz/dartz.dart';
import 'package:exn_hr/features/salary/domain/entities/payslip.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

abstract class SalaryRepository {
  Future<Either<ApiError, List<Payslip>>> getPayslips({int page = 1, int size = 12});
  Future<Either<ApiError, Payslip>> getPayslipById(String id);
}
