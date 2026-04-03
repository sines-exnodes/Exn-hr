import 'package:equatable/equatable.dart';
import 'package:exn_hr/features/projects/domain/entities/project.dart';

enum ProjectsStatus { initial, loading, success, failure }

enum ProjectStatusFilter { all, active, completed, onHold }

extension ProjectStatusFilterExt on ProjectStatusFilter {
  String get label {
    switch (this) {
      case ProjectStatusFilter.all:
        return 'Tất cả';
      case ProjectStatusFilter.active:
        return 'Đang hoạt động';
      case ProjectStatusFilter.completed:
        return 'Hoàn thành';
      case ProjectStatusFilter.onHold:
        return 'Tạm dừng';
    }
  }

  String? get apiValue {
    switch (this) {
      case ProjectStatusFilter.all:
        return null;
      case ProjectStatusFilter.active:
        return 'active';
      case ProjectStatusFilter.completed:
        return 'completed';
      case ProjectStatusFilter.onHold:
        return 'on_hold';
    }
  }
}

class ProjectsState extends Equatable {
  const ProjectsState({
    this.status = ProjectsStatus.initial,
    this.allProjects = const [],
    this.filteredProjects = const [],
    this.errorMessage,
    this.searchQuery = '',
    this.statusFilter = ProjectStatusFilter.all,
    this.currentPage = 1,
    this.hasMore = true,
    this.isPaginating = false,
  });

  final ProjectsStatus status;
  final List<Project> allProjects;
  final List<Project> filteredProjects;
  final String? errorMessage;
  final String searchQuery;
  final ProjectStatusFilter statusFilter;
  final int currentPage;
  final bool hasMore;
  final bool isPaginating;

  /// Backward-compat getter used by existing widgets
  List<Project> get projects => filteredProjects;

  ProjectsState copyWith({
    ProjectsStatus? status,
    List<Project>? allProjects,
    List<Project>? filteredProjects,
    String? errorMessage,
    String? searchQuery,
    ProjectStatusFilter? statusFilter,
    int? currentPage,
    bool? hasMore,
    bool? isPaginating,
  }) {
    return ProjectsState(
      status: status ?? this.status,
      allProjects: allProjects ?? this.allProjects,
      filteredProjects: filteredProjects ?? this.filteredProjects,
      errorMessage: errorMessage ?? this.errorMessage,
      searchQuery: searchQuery ?? this.searchQuery,
      statusFilter: statusFilter ?? this.statusFilter,
      currentPage: currentPage ?? this.currentPage,
      hasMore: hasMore ?? this.hasMore,
      isPaginating: isPaginating ?? this.isPaginating,
    );
  }

  @override
  List<Object?> get props => [
        status,
        allProjects,
        filteredProjects,
        errorMessage,
        searchQuery,
        statusFilter,
        currentPage,
        hasMore,
        isPaginating,
      ];
}
