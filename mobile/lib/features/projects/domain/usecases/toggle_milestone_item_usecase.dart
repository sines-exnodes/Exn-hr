import 'package:dartz/dartz.dart';
import 'package:exn_hr/features/projects/domain/repositories/project_repository.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

class ToggleMilestoneItemUseCase {
  ToggleMilestoneItemUseCase(this._repository);
  final ProjectRepository _repository;

  Future<Either<ApiError, void>> call(int milestoneId, int itemId) {
    return _repository.toggleMilestoneItem(milestoneId, itemId);
  }
}
