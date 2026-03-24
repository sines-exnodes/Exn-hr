import 'package:exn_hr/features/authentication/data/models/user_model.dart';

class AuthResponseModel {
  const AuthResponseModel({
    required this.success,
    this.message,
    this.data,
  });

  final bool success;
  final String? message;
  final AuthResponseData? data;

  factory AuthResponseModel.fromJson(Map<String, dynamic> json) {
    return AuthResponseModel(
      success: json['success'] as bool? ?? false,
      message: json['message'] as String?,
      data: json['data'] != null
          ? AuthResponseData.fromJson(json['data'] as Map<String, dynamic>)
          : null,
    );
  }
}

class AuthResponseData {
  const AuthResponseData({
    required this.token,
    required this.user,
  });

  final String token;
  final UserModel user;

  factory AuthResponseData.fromJson(Map<String, dynamic> json) {
    return AuthResponseData(
      token: json['token'] as String,
      user: UserModel.fromJson(json['user'] as Map<String, dynamic>),
    );
  }
}
