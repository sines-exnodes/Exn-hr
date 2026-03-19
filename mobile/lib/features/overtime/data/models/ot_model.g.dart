// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'ot_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OtModel _$OtModelFromJson(Map<String, dynamic> json) => OtModel(
      id: json['id'] as String,
      date: json['date'] as String,
      startTime: json['start_time'] as String,
      endTime: json['end_time'] as String,
      totalHours: (json['total_hours'] as num).toDouble(),
      reason: json['reason'] as String,
      status: json['status'] as String,
      leaderApproval: json['leader_approval'] as String?,
      ceoApproval: json['ceo_approval'] as String?,
      createdAt: json['created_at'] as String?,
      employeeId: json['employee_id'] as String?,
      employeeName: json['employee_name'] as String?,
    );

Map<String, dynamic> _$OtModelToJson(OtModel instance) => <String, dynamic>{
      'id': instance.id,
      'date': instance.date,
      'start_time': instance.startTime,
      'end_time': instance.endTime,
      'total_hours': instance.totalHours,
      'reason': instance.reason,
      'status': instance.status,
      'leader_approval': instance.leaderApproval,
      'ceo_approval': instance.ceoApproval,
      'created_at': instance.createdAt,
      'employee_id': instance.employeeId,
      'employee_name': instance.employeeName,
    };
