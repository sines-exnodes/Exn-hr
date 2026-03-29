import 'package:dartz/dartz.dart';
import 'package:exn_hr/features/projects/domain/entities/project.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

abstract class ProjectRepository {
  Future<Either<ApiError, List<Project>>> getMyProjects();
  Future<Either<ApiError, Project>> getProjectDetail(int id);
  Future<Either<ApiError, List<Milestone>>> getUpcomingMilestones({int days = 7});
}
