class ProjectModel {
  const ProjectModel({
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
  final List<MilestoneModel> milestones;
  final List<ProjectMemberModel> members;

  factory ProjectModel.fromJson(Map<String, dynamic> json) {
    return ProjectModel(
      id: json['id'] as int,
      name: json['name'] as String,
      status: json['status'] as String? ?? 'active',
      startDate: json['start_date'] as String,
      description: json['description'] as String?,
      endDate: json['end_date'] as String?,
      milestones: (json['milestones'] as List<dynamic>? ?? [])
          .map((e) => MilestoneModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      members: (json['members'] as List<dynamic>? ?? [])
          .map((e) => ProjectMemberModel.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}

class ProjectMemberModel {
  const ProjectMemberModel({
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

  factory ProjectMemberModel.fromJson(Map<String, dynamic> json) {
    final employee = json['employee'] as Map<String, dynamic>?;
    return ProjectMemberModel(
      id: json['id'] as int,
      projectId: json['project_id'] as int,
      employeeId: json['employee_id'] as int,
      projectRole: json['project_role'] as String? ?? 'other',
      employeeName: employee?['full_name'] as String?,
      joinedAt: json['joined_at'] as String?,
    );
  }
}

class MilestoneItemModel {
  const MilestoneItemModel({
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

  factory MilestoneItemModel.fromJson(Map<String, dynamic> json) {
    return MilestoneItemModel(
      id: json['id'] as int,
      milestoneId: json['milestone_id'] as int,
      content: json['content'] as String,
      isCompleted: json['is_completed'] as bool? ?? false,
      displayOrder: json['display_order'] as int? ?? 0,
    );
  }
}

class MilestoneModel {
  const MilestoneModel({
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
  final List<MilestoneItemModel> items;

  factory MilestoneModel.fromJson(Map<String, dynamic> json) {
    final project = json['project'] as Map<String, dynamic>?;
    return MilestoneModel(
      id: json['id'] as int,
      projectId: json['project_id'] as int,
      title: json['title'] as String,
      deadline: json['deadline'] as String,
      status: json['status'] as String? ?? 'upcoming',
      description: json['description'] as String?,
      completedAt: json['completed_at'] as String?,
      projectName: project?['name'] as String?,
      items: (json['items'] as List<dynamic>? ?? [])
          .map((e) => MilestoneItemModel.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}
