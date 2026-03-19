import 'package:exn_hr/features/authentication/data/models/user_model.dart';
import 'package:json_annotation/json_annotation.dart';

part 'auth_response_model.g.dart';

@JsonSerializable()
class AuthResponseModel {
  const AuthResponseModel({
    required this.success,
    this.message,
    this.data,
  });

  final bool success;
  final String? message;
  final AuthResponseData? data;

  factory AuthResponseModel.fromJson(Map<String, dynamic> json) =>
      _$AuthResponseModelFromJson(json);
  Map<String, dynamic> toJson() => _$AuthResponseModelToJson(this);
}

@JsonSerializable()
class AuthResponseData {
  const AuthResponseData({
    required this.accessToken,
    required this.user,
  });

  @JsonKey(name: 'access_token')
  final String accessToken;
  final UserModel user;

  factory AuthResponseData.fromJson(Map<String, dynamic> json) =>
      _$AuthResponseDataFromJson(json);
  Map<String, dynamic> toJson() => _$AuthResponseDataToJson(this);
}
