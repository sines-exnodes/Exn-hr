import 'package:dartz/dartz.dart';
import 'package:exn_hr/features/projects/domain/entities/project.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

abstract class ProjectRepository {
  Future<Either<ApiError, List<Project>>> getMyProjects({int page = 1, int size = 10});
  Future<Either<ApiError, Project>> getProjectDetail(int id);
  Future<Either<ApiError, List<Milestone>>> getUpcomingMilestones({int days = 7});
  Future<Either<ApiError, void>> toggleMilestoneItem(int milestoneId, int itemId);
}
