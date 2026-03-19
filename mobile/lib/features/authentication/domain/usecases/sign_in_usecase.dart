import 'package:dartz/dartz.dart';
import 'package:exn_hr/features/authentication/domain/entities/user.dart';
import 'package:exn_hr/features/authentication/domain/repositories/auth_repository.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

class SignInUseCase {
  SignInUseCase(this._repository);

  final AuthRepository _repository;

  Future<Either<ApiError, User>> call({
    required String email,
    required String password,
  }) {
    return _repository.signIn(email: email, password: password);
  }
}
