import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import 'package:exn_hr/core/network/api/api_client.dart';
import 'package:exn_hr/core/network/api/api_endpoints.dart';
import 'package:exn_hr/features/profile/data/mappers/profile_mapper.dart';
import 'package:exn_hr/features/profile/data/models/profile_model.dart';
import 'package:exn_hr/features/profile/domain/entities/profile.dart';
import 'package:exn_hr/features/profile/domain/repositories/profile_repository.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

class ProfileRepositoryImpl implements ProfileRepository {
  ProfileRepositoryImpl({required ApiClient apiClient}) : _apiClient = apiClient;
  final ApiClient _apiClient;

  @override
  Future<Either<ApiError, Profile>> getProfile() async {
    try {
      final response = await _apiClient.get(ApiEndpoints.myProfile);
      final data = (response.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
      return Right(ProfileModel.fromJson(data).toEntity());
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
