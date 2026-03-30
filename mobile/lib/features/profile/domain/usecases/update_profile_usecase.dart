import 'package:dartz/dartz.dart';
import 'package:exn_hr/features/profile/domain/entities/profile.dart';
import 'package:exn_hr/features/profile/domain/repositories/profile_repository.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

class UpdateProfileUseCase {
  UpdateProfileUseCase(this._repository);
  final ProfileRepository _repository;

  Future<Either<ApiError, Profile>> call({required Map<String, dynamic> data}) {
    return _repository.updateMyProfile(data: data);
  }
}
