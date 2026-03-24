import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import 'package:exn_hr/core/network/api/api_client.dart';
import 'package:exn_hr/core/network/api/api_endpoints.dart';
import 'package:exn_hr/features/authentication/data/mappers/user_mapper.dart';
import 'package:exn_hr/features/authentication/data/models/auth_response_model.dart';
import 'package:exn_hr/features/authentication/data/models/user_model.dart';
import 'package:exn_hr/features/authentication/domain/entities/user.dart';
import 'package:exn_hr/features/authentication/domain/repositories/auth_repository.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

class AuthRepositoryImpl implements AuthRepository {
  AuthRepositoryImpl({required ApiClient apiClient}) : _apiClient = apiClient;
  final ApiClient _apiClient;

  @override
  Future<Either<ApiError, (String token, User user)>> signIn({required String email, required String password}) async {
    try {
      final response = await _apiClient.post(ApiEndpoints.login, data: {'email': email, 'password': password});
      final authResponse = AuthResponseModel.fromJson(response.data as Map<String, dynamic>);
      if (authResponse.success && authResponse.data != null) {
        final data = authResponse.data!;
        return Right((data.token, data.user.toEntity()));
      }
      return Left(ApiError(message: authResponse.message ?? 'Sign in failed'));
    } on DioException catch (e) { return Left(ApiError.fromDioError(e)); } catch (e) { return Left(ApiError.unknown()); }
  }

  @override
  Future<Either<ApiError, User>> getCurrentUser() async {
    try {
      final response = await _apiClient.get(ApiEndpoints.me);
      final data = (response.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
      return Right(UserModel.fromJson(data).toEntity());
    } on DioException catch (e) { return Left(ApiError.fromDioError(e)); } catch (e) { return Left(ApiError.unknown()); }
  }

  @override
  Future<Either<ApiError, void>> changePassword({required String oldPassword, required String newPassword}) async {
    try {
      await _apiClient.post(ApiEndpoints.changePassword, data: {'old_password': oldPassword, 'new_password': newPassword});
      return const Right(null);
    } on DioException catch (e) { return Left(ApiError.fromDioError(e)); } catch (e) { return Left(ApiError.unknown()); }
  }
}
