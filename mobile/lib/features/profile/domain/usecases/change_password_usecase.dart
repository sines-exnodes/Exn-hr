import 'package:dartz/dartz.dart';
import 'package:exn_hr/features/profile/domain/repositories/profile_repository.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

class ChangePasswordUseCase {
  ChangePasswordUseCase(this._repository);
  final ProfileRepository _repository;

  Future<Either<ApiError, void>> call({required String oldPassword, required String newPassword}) {
    return _repository.changePassword(oldPassword: oldPassword, newPassword: newPassword);
  }
}
