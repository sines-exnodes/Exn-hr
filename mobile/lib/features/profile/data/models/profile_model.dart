import 'package:json_annotation/json_annotation.dart';

part 'profile_model.g.dart';

@JsonSerializable()
class ProfileModel {
  const ProfileModel({
    required this.id,
    required this.email,
    this.fullName,
    this.role,
    this.phone,
    this.department,
    this.teamId,
    this.teamName,
    this.avatarUrl,
    this.dateOfBirth,
    this.joinDate,
    this.address,
  });

  final String id;
  final String email;
  @JsonKey(name: 'full_name')
  final String? fullName;
  final String? role;
  final String? phone;
  final String? department;
  @JsonKey(name: 'team_id')
  final String? teamId;
  @JsonKey(name: 'team_name')
  final String? teamName;
  @JsonKey(name: 'avatar_url')
  final String? avatarUrl;
  @JsonKey(name: 'date_of_birth')
  final String? dateOfBirth;
  @JsonKey(name: 'join_date')
  final String? joinDate;
  final String? address;

  factory ProfileModel.fromJson(Map<String, dynamic> json) =>
      _$ProfileModelFromJson(json);
  Map<String, dynamic> toJson() => _$ProfileModelToJson(this);
}
