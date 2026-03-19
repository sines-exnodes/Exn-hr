import 'package:json_annotation/json_annotation.dart';

part 'user_model.g.dart';

@JsonSerializable()
class UserModel {
  const UserModel({
    required this.id,
    required this.email,
    this.fullName,
    this.role,
    this.department,
    this.avatarUrl,
  });

  final String id;
  final String email;
  @JsonKey(name: 'full_name')
  final String? fullName;
  final String? role;
  final String? department;
  @JsonKey(name: 'avatar_url')
  final String? avatarUrl;

  factory UserModel.fromJson(Map<String, dynamic> json) => _$UserModelFromJson(json);
  Map<String, dynamic> toJson() => _$UserModelToJson(this);
}
