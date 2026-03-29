import 'package:equatable/equatable.dart';
import 'package:exn_hr/features/projects/domain/entities/project.dart';

enum ProjectDetailStatus { initial, loading, success, failure }

class ProjectDetailState extends Equatable {
  const ProjectDetailState({
    this.status = ProjectDetailStatus.initial,
    this.project,
    this.errorMessage,
  });

  final ProjectDetailStatus status;
  final Project? project;
  final String? errorMessage;

  ProjectDetailState copyWith({
    ProjectDetailStatus? status,
    Project? project,
    String? errorMessage,
  }) {
    return ProjectDetailState(
      status: status ?? this.status,
      project: project ?? this.project,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [status, project, errorMessage];
}
