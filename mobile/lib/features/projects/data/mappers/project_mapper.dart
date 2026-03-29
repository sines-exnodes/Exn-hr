import 'package:exn_hr/features/projects/data/models/project_model.dart';
import 'package:exn_hr/features/projects/domain/entities/project.dart';

extension ProjectMapper on ProjectModel {
  Project toEntity() {
    return Project(
      id: id,
      name: name,
      status: status,
      startDate: startDate,
      description: description,
      endDate: endDate,
      milestones: milestones.map((m) => m.toEntity()).toList(),
      members: members.map((m) => m.toEntity()).toList(),
    );
  }
}

extension ProjectMemberMapper on ProjectMemberModel {
  ProjectMember toEntity() {
    return ProjectMember(
      id: id,
      projectId: projectId,
      employeeId: employeeId,
      projectRole: projectRole,
      employeeName: employeeName,
      joinedAt: joinedAt,
    );
  }
}

extension MilestoneItemMapper on MilestoneItemModel {
  MilestoneItem toEntity() {
    return MilestoneItem(
      id: id,
      milestoneId: milestoneId,
      content: content,
      isCompleted: isCompleted,
      displayOrder: displayOrder,
    );
  }
}

extension MilestoneMapper on MilestoneModel {
  Milestone toEntity() {
    return Milestone(
      id: id,
      projectId: projectId,
      title: title,
      deadline: deadline,
      status: status,
      description: description,
      completedAt: completedAt,
      projectName: projectName,
      items: items.map((i) => i.toEntity()).toList(),
    );
  }
}
