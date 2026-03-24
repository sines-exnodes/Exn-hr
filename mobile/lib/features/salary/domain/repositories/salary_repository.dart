import 'package:dartz/dartz.dart';
import 'package:exn_hr/features/salary/domain/entities/payslip.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

abstract class SalaryRepository {
  Future<Either<ApiError, Payslip>> getMySalary({required int month, required int year});
}
