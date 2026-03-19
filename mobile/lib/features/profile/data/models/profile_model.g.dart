// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'profile_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ProfileModel _$ProfileModelFromJson(Map<String, dynamic> json) => ProfileModel(
      id: json['id'] as String,
      email: json['email'] as String,
      fullName: json['full_name'] as String?,
      role: json['role'] as String?,
      phone: json['phone'] as String?,
      department: json['department'] as String?,
      teamId: json['team_id'] as String?,
      teamName: json['team_name'] as String?,
      avatarUrl: json['avatar_url'] as String?,
      dateOfBirth: json['date_of_birth'] as String?,
      joinDate: json['join_date'] as String?,
      address: json['address'] as String?,
    );

Map<String, dynamic> _$ProfileModelToJson(ProfileModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'email': instance.email,
      'full_name': instance.fullName,
      'role': instance.role,
      'phone': instance.phone,
      'department': instance.department,
      'team_id': instance.teamId,
      'team_name': instance.teamName,
      'avatar_url': instance.avatarUrl,
      'date_of_birth': instance.dateOfBirth,
      'join_date': instance.joinDate,
      'address': instance.address,
    };
