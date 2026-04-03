import 'package:exn_hr/features/projects/domain/entities/project.dart';
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

  static const int _pageSize = 10;

  /// Initial load or pull-to-refresh (resets pagination).
  Future<void> loadProjects() async {
    emit(state.copyWith(
      status: ProjectsStatus.loading,
      allProjects: const [],
      filteredProjects: const [],
      currentPage: 1,
      hasMore: true,
      isPaginating: false,
    ));
    final result = await _getMyProjectsUseCase(page: 1, size: _pageSize);
    if (isClosed) return;
    result.fold(
      (error) => emit(state.copyWith(
        status: ProjectsStatus.failure,
        errorMessage: error.message,
      )),
      (projects) {
        final filtered = _applyFilters(
          projects,
          state.searchQuery,
          state.statusFilter,
        );
        emit(state.copyWith(
          status: ProjectsStatus.success,
          allProjects: projects,
          filteredProjects: filtered,
          currentPage: 1,
          hasMore: projects.length >= _pageSize,
        ));
      },
    );
  }

  /// Load the next page and append.
  Future<void> loadNextPage() async {
    if (!state.hasMore || state.isPaginating) return;
    emit(state.copyWith(isPaginating: true));
    final nextPage = state.currentPage + 1;
    final result =
        await _getMyProjectsUseCase(page: nextPage, size: _pageSize);
    if (isClosed) return;
    result.fold(
      (error) => emit(state.copyWith(isPaginating: false)),
      (newProjects) {
        final combined = [...state.allProjects, ...newProjects];
        final filtered = _applyFilters(
          combined,
          state.searchQuery,
          state.statusFilter,
        );
        emit(state.copyWith(
          allProjects: combined,
          filteredProjects: filtered,
          currentPage: nextPage,
          hasMore: newProjects.length >= _pageSize,
          isPaginating: false,
        ));
      },
    );
  }

  void updateSearchQuery(String query) {
    final filtered =
        _applyFilters(state.allProjects, query, state.statusFilter);
    emit(state.copyWith(searchQuery: query, filteredProjects: filtered));
  }

  void updateStatusFilter(ProjectStatusFilter filter) {
    final filtered =
        _applyFilters(state.allProjects, state.searchQuery, filter);
    emit(state.copyWith(statusFilter: filter, filteredProjects: filtered));
  }

  List<Project> _applyFilters(
    List<Project> projects,
    String query,
    ProjectStatusFilter filter,
  ) {
    return projects.where((p) {
      final matchesStatus = filter == ProjectStatusFilter.all ||
          p.status == filter.apiValue;
      final matchesQuery = query.isEmpty ||
          p.name.toLowerCase().contains(query.toLowerCase());
      return matchesStatus && matchesQuery;
    }).toList();
  }
}
