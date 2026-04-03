import 'package:dartz/dartz.dart';
import 'package:exn_hr/features/projects/domain/entities/project.dart';
import 'package:exn_hr/features/projects/domain/repositories/project_repository.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

class GetMyProjectsUseCase {
  GetMyProjectsUseCase(this._repository);
  final ProjectRepository _repository;

  Future<Either<ApiError, List<Project>>> call({int page = 1, int size = 10}) {
    return _repository.getMyProjects(page: page, size: size);
  }
}
