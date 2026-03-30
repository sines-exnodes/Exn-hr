import 'package:exn_hr/features/projects/domain/usecases/get_my_projects_usecase.dart';
import 'package:exn_hr/features/projects/ui/list/view_models/projects_state.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class ProjectsCubit extends Cubit<ProjectsState> {
  ProjectsCubit({required GetMyProjectsUseCase getMyProjectsUseCase})
      : _getMyProjectsUseCase = getMyProjectsUseCase,
        super(const ProjectsState()) {
    loadProjects();
  }

  final GetMyProjectsUseCase _getMyProjectsUseCase;

  Future<void> loadProjects() async {
    emit(state.copyWith(status: ProjectsStatus.loading));
    final result = await _getMyProjectsUseCase();
    if (isClosed) return;
    result.fold(
      (error) => emit(state.copyWith(
        status: ProjectsStatus.failure,
        errorMessage: error.message,
      )),
      (projects) => emit(state.copyWith(
        status: ProjectsStatus.success,
        projects: projects,
      )),
    );
  }
}
