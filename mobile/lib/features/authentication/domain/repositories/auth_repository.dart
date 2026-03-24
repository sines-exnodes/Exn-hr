import 'package:dartz/dartz.dart';
import 'package:exn_hr/features/authentication/domain/entities/user.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

abstract class AuthRepository {
  Future<Either<ApiError, (String token, User user)>> signIn({required String email, required String password});
  Future<Either<ApiError, User>> getCurrentUser();
  Future<Either<ApiError, void>> changePassword({required String oldPassword, required String newPassword});
}
