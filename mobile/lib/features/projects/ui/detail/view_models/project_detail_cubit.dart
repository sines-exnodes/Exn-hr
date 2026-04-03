import 'package:exn_hr/features/projects/domain/entities/project.dart';
import 'package:exn_hr/features/projects/domain/usecases/get_project_detail_usecase.dart';
import 'package:exn_hr/features/projects/domain/usecases/toggle_milestone_item_usecase.dart';
import 'package:exn_hr/features/projects/ui/detail/view_models/project_detail_state.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class ProjectDetailCubit extends Cubit<ProjectDetailState> {
  ProjectDetailCubit({
    required GetProjectDetailUseCase getProjectDetailUseCase,
    required ToggleMilestoneItemUseCase toggleMilestoneItemUseCase,
  })  : _getProjectDetailUseCase = getProjectDetailUseCase,
        _toggleMilestoneItemUseCase = toggleMilestoneItemUseCase,
        super(const ProjectDetailState());

  final GetProjectDetailUseCase _getProjectDetailUseCase;
  final ToggleMilestoneItemUseCase _toggleMilestoneItemUseCase;

  Future<void> loadDetail(int projectId) async {
    emit(state.copyWith(status: ProjectDetailStatus.loading));
    final result = await _getProjectDetailUseCase(projectId);
    if (isClosed) return;
    result.fold(
      (error) => emit(state.copyWith(
        status: ProjectDetailStatus.failure,
        errorMessage: error.message,
      )),
      (project) => emit(state.copyWith(
        status: ProjectDetailStatus.success,
        project: project,
      )),
    );
  }

  Future<void> toggleMilestoneItem(int milestoneId, int itemId) async {
    final currentProject = state.project;
    if (currentProject == null) return;

    // Optimistic update — flip isCompleted immediately
    final updatedProject = _toggleItemInProject(currentProject, milestoneId, itemId);
    emit(state.copyWith(project: updatedProject));

    final result = await _toggleMilestoneItemUseCase(milestoneId, itemId);
    if (isClosed) return;

    result.fold(
      (error) {
        // Revert on failure
        emit(state.copyWith(project: currentProject));
      },
      (_) {
        // Success — optimistic state already applied
      },
    );
  }

  Project _toggleItemInProject(Project project, int milestoneId, int itemId) {
    final updatedMilestones = project.milestones.map((m) {
      if (m.id != milestoneId) return m;
      final updatedItems = m.items.map((item) {
        if (item.id != itemId) return item;
        return MilestoneItem(
          id: item.id,
          milestoneId: item.milestoneId,
          content: item.content,
          isCompleted: !item.isCompleted,
          displayOrder: item.displayOrder,
        );
      }).toList();
      return Milestone(
        id: m.id,
        projectId: m.projectId,
        title: m.title,
        deadline: m.deadline,
        status: m.status,
        description: m.description,
        completedAt: m.completedAt,
        projectName: m.projectName,
        items: updatedItems,
      );
    }).toList();

    return Project(
      id: project.id,
      name: project.name,
      status: project.status,
      startDate: project.startDate,
      description: project.description,
      endDate: project.endDate,
      milestones: updatedMilestones,
      members: project.members,
    );
  }
}
