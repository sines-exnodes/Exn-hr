import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import 'package:exn_hr/core/network/api/api_client.dart';
import 'package:exn_hr/core/network/api/api_endpoints.dart';
import 'package:exn_hr/features/salary/data/mappers/payslip_mapper.dart';
import 'package:exn_hr/features/salary/data/models/payslip_model.dart';
import 'package:exn_hr/features/salary/domain/entities/payslip.dart';
import 'package:exn_hr/features/salary/domain/repositories/salary_repository.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

class SalaryRepositoryImpl implements SalaryRepository {
  SalaryRepositoryImpl({required ApiClient apiClient}) : _apiClient = apiClient;
  final ApiClient _apiClient;

  @override
  Future<Either<ApiError, Payslip>> getMySalary({required int month, required int year}) async {
    try {
      final response = await _apiClient.get(ApiEndpoints.salaryMe, queryParameters: {'month': month, 'year': year});
      final data = (response.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
      return Right(PayslipModel.fromJson(data).toEntity());
    } on DioException catch (e) { return Left(ApiError.fromDioError(e)); } catch (e) { return Left(ApiError.unknown()); }
  }
}
