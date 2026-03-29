import 'package:equatable/equatable.dart';

class MilestoneItem extends Equatable {
  const MilestoneItem({
    required this.id,
    required this.milestoneId,
    required this.content,
    required this.isCompleted,
    required this.displayOrder,
  });

  final int id;
  final int milestoneId;
  final String content;
  final bool isCompleted;
  final int displayOrder;

  @override
  List<Object?> get props => [id, milestoneId, content, isCompleted, displayOrder];
}

class Project extends Equatable {
  const Project({
    required this.id,
    required this.name,
    required this.status,
    required this.startDate,
    this.description,
    this.endDate,
    this.milestones = const [],
    this.members = const [],
  });

  final int id;
  final String name;
  final String status;
  final String startDate;
  final String? description;
  final String? endDate;
  final List<Milestone> milestones;
  final List<ProjectMember> members;

  @override
  List<Object?> get props => [id, name, status, startDate];
}

class ProjectMember extends Equatable {
  const ProjectMember({
    required this.id,
    required this.projectId,
    required this.employeeId,
    required this.projectRole,
    this.employeeName,
    this.joinedAt,
  });

  final int id;
  final int projectId;
  final int employeeId;
  final String projectRole;
  final String? employeeName;
  final String? joinedAt;

  @override
  List<Object?> get props => [id, projectId, employeeId, projectRole];
}

class Milestone extends Equatable {
  const Milestone({
    required this.id,
    required this.projectId,
    required this.title,
    required this.deadline,
    required this.status,
    this.description,
    this.completedAt,
    this.projectName,
    this.items = const [],
  });

  final int id;
  final int projectId;
  final String title;
  final String deadline;
  final String status;
  final String? description;
  final String? completedAt;
  final String? projectName;
  final List<MilestoneItem> items;

  bool get isOverdue {
    final deadlineDate = DateTime.tryParse(deadline);
    if (deadlineDate == null) return false;
    return deadlineDate.isBefore(DateTime.now()) && status != 'completed';
  }

  bool get isUpcoming {
    final deadlineDate = DateTime.tryParse(deadline);
    if (deadlineDate == null) return false;
    final now = DateTime.now();
    return deadlineDate.isAfter(now) &&
        deadlineDate.isBefore(now.add(const Duration(days: 7)));
  }

  @override
  List<Object?> get props => [id, projectId, title, deadline, status];
}
