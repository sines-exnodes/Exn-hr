import 'package:dartz/dartz.dart';
import 'package:exn_hr/features/salary/domain/entities/payslip.dart';
import 'package:exn_hr/features/salary/domain/repositories/salary_repository.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

class GetPayslipUseCase {
  GetPayslipUseCase(this._repository);
  final SalaryRepository _repository;

  Future<Either<ApiError, Payslip>> call({required int month, required int year}) {
    return _repository.getMySalary(month: month, year: year);
  }
}
