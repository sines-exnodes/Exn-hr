import 'package:dartz/dartz.dart';
import 'package:exn_hr/features/profile/domain/entities/profile.dart';
import 'package:exn_hr/features/profile/domain/repositories/profile_repository.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

class GetProfileUseCase {
  GetProfileUseCase(this._repository);
  final ProfileRepository _repository;

  Future<Either<ApiError, Profile>> call() {
    return _repository.getProfile();
  }
}
