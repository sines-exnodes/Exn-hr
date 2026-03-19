// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'attendance_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AttendanceModel _$AttendanceModelFromJson(Map<String, dynamic> json) =>
    AttendanceModel(
      id: json['id'] as String,
      date: json['date'] as String,
      checkInTime: json['check_in_time'] as String?,
      checkOutTime: json['check_out_time'] as String?,
      totalHours: json['total_hours'] as String?,
      location: json['location'] as String?,
      verificationMethod: json['verification_method'] as String?,
    );

Map<String, dynamic> _$AttendanceModelToJson(AttendanceModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'date': instance.date,
      'check_in_time': instance.checkInTime,
      'check_out_time': instance.checkOutTime,
      'total_hours': instance.totalHours,
      'location': instance.location,
      'verification_method': instance.verificationMethod,
    };
