import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import 'package:exn_hr/core/network/api/api_client.dart';
import 'package:exn_hr/core/network/api/api_endpoints.dart';
import 'package:exn_hr/features/authentication/data/mappers/user_mapper.dart';
import 'package:exn_hr/features/authentication/data/models/auth_response_model.dart';
import 'package:exn_hr/features/authentication/domain/entities/user.dart';
import 'package:exn_hr/features/authentication/domain/repositories/auth_repository.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

class AuthRepositoryImpl implements AuthRepository {
  AuthRepositoryImpl({required ApiClient apiClient}) : _apiClient = apiClient;

  final ApiClient _apiClient;

  @override
  Future<Either<ApiError, User>> signIn({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _apiClient.post(
        ApiEndpoints.signIn,
        data: {'email': email, 'password': password},
      );
      final authResponse = AuthResponseModel.fromJson(
        response.data as Map<String, dynamic>,
      );
      if (authResponse.success && authResponse.data != null) {
        return Right(authResponse.data!.user.toEntity());
      }
      return Left(ApiError(message: authResponse.message ?? 'Sign in failed'));
    } on DioException catch (e) {
      return Left(ApiError.fromDioError(e));
    } catch (e) {
      return Left(ApiError.unknown());
    }
  }

  @override
  Future<Either<ApiError, void>> signOut() async {
    try {
      await _apiClient.post(ApiEndpoints.signOut);
      return const Right(null);
    } on DioException catch (e) {
      return Left(ApiError.fromDioError(e));
    } catch (e) {
      return Left(ApiError.unknown());
    }
  }

  @override
  Future<Either<ApiError, void>> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      await _apiClient.post(
        ApiEndpoints.changePassword,
        data: {
          'current_password': currentPassword,
          'new_password': newPassword,
        },
      );
      return const Right(null);
    } on DioException catch (e) {
      return Left(ApiError.fromDioError(e));
    } catch (e) {
      return Left(ApiError.unknown());
    }
  }
}
