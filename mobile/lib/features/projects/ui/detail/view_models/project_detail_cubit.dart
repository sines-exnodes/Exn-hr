import 'package:exn_hr/features/projects/domain/usecases/get_project_detail_usecase.dart';
import 'package:exn_hr/features/projects/ui/detail/view_models/project_detail_state.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class ProjectDetailCubit extends Cubit<ProjectDetailState> {
  ProjectDetailCubit({required GetProjectDetailUseCase getProjectDetailUseCase})
      : _getProjectDetailUseCase = getProjectDetailUseCase,
        super(const ProjectDetailState());

  final GetProjectDetailUseCase _getProjectDetailUseCase;

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
}
