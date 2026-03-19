import 'package:dartz/dartz.dart';
import 'package:exn_hr/features/salary/domain/entities/payslip.dart';
import 'package:exn_hr/features/salary/domain/repositories/salary_repository.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

class GetPayslipUseCase {
  GetPayslipUseCase(this._repository);
  final SalaryRepository _repository;

  Future<Either<ApiError, List<Payslip>>> call({int page = 1, int size = 12}) {
    return _repository.getPayslips(page: page, size: size);
  }
}
