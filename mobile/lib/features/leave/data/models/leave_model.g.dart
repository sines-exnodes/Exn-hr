// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'leave_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

LeaveModel _$LeaveModelFromJson(Map<String, dynamic> json) => LeaveModel(
      id: json['id'] as String,
      type: json['type'] as String,
      startDate: json['start_date'] as String,
      endDate: json['end_date'] as String,
      totalDays: (json['total_days'] as num).toInt(),
      reason: json['reason'] as String,
      status: json['status'] as String,
      leaderApproval: json['leader_approval'] as String?,
      hrApproval: json['hr_approval'] as String?,
      createdAt: json['created_at'] as String?,
      employeeId: json['employee_id'] as String?,
      employeeName: json['employee_name'] as String?,
    );

Map<String, dynamic> _$LeaveModelToJson(LeaveModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': instance.type,
      'start_date': instance.startDate,
      'end_date': instance.endDate,
      'total_days': instance.totalDays,
      'reason': instance.reason,
      'status': instance.status,
      'leader_approval': instance.leaderApproval,
      'hr_approval': instance.hrApproval,
      'created_at': instance.createdAt,
      'employee_id': instance.employeeId,
      'employee_name': instance.employeeName,
    };
