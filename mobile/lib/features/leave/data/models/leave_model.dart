import 'package:json_annotation/json_annotation.dart';

part 'leave_model.g.dart';

@JsonSerializable()
class LeaveModel {
  const LeaveModel({
    required this.id,
    required this.type,
    required this.startDate,
    required this.endDate,
    required this.totalDays,
    required this.reason,
    required this.status,
    this.leaderApproval,
    this.hrApproval,
    this.createdAt,
    this.employeeId,
    this.employeeName,
  });

  final String id;
  final String type;
  @JsonKey(name: 'start_date')
  final String startDate;
  @JsonKey(name: 'end_date')
  final String endDate;
  @JsonKey(name: 'total_days')
  final int totalDays;
  final String reason;
  final String status;
  @JsonKey(name: 'leader_approval')
  final String? leaderApproval;
  @JsonKey(name: 'hr_approval')
  final String? hrApproval;
  @JsonKey(name: 'created_at')
  final String? createdAt;
  @JsonKey(name: 'employee_id')
  final String? employeeId;
  @JsonKey(name: 'employee_name')
  final String? employeeName;

  factory LeaveModel.fromJson(Map<String, dynamic> json) => _$LeaveModelFromJson(json);
  Map<String, dynamic> toJson() => _$LeaveModelToJson(this);
}
