import 'package:equatable/equatable.dart';
import 'package:exn_hr/features/projects/domain/entities/project.dart';

enum ProjectsStatus { initial, loading, success, failure }

class ProjectsState extends Equatable {
  const ProjectsState({
    this.status = ProjectsStatus.initial,
    this.projects = const [],
    this.errorMessage,
  });

  final ProjectsStatus status;
  final List<Project> projects;
  final String? errorMessage;

  ProjectsState copyWith({
    ProjectsStatus? status,
    List<Project>? projects,
    String? errorMessage,
  }) {
    return ProjectsState(
      status: status ?? this.status,
      projects: projects ?? this.projects,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [status, projects, errorMessage];
}
