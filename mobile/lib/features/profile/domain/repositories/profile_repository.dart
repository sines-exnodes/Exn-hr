import 'package:dartz/dartz.dart';
import 'package:exn_hr/features/profile/domain/entities/profile.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

abstract class ProfileRepository {
  Future<Either<ApiError, Profile>> getProfile();
  Future<Either<ApiError, void>> changePassword({required String oldPassword, required String newPassword});
  Future<Either<ApiError, Profile>> updateMyProfile({required Map<String, dynamic> data});
  Future<Either<ApiError, String>> uploadFile({required String filePath, String? folder});
}
