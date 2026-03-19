import 'package:json_annotation/json_annotation.dart';

part 'ot_model.g.dart';

@JsonSerializable()
class OtModel {
  const OtModel({
    required this.id,
    required this.date,
    required this.startTime,
    required this.endTime,
    required this.totalHours,
    required this.reason,
    required this.status,
    this.leaderApproval,
    this.ceoApproval,
    this.createdAt,
    this.employeeId,
    this.employeeName,
  });

  final String id;
  final String date;
  @JsonKey(name: 'start_time')
  final String startTime;
  @JsonKey(name: 'end_time')
  final String endTime;
  @JsonKey(name: 'total_hours')
  final double totalHours;
  final String reason;
  final String status;
  @JsonKey(name: 'leader_approval')
  final String? leaderApproval;
  @JsonKey(name: 'ceo_approval')
  final String? ceoApproval;
  @JsonKey(name: 'created_at')
  final String? createdAt;
  @JsonKey(name: 'employee_id')
  final String? employeeId;
  @JsonKey(name: 'employee_name')
  final String? employeeName;

  factory OtModel.fromJson(Map<String, dynamic> json) => _$OtModelFromJson(json);
  Map<String, dynamic> toJson() => _$OtModelToJson(this);
}
