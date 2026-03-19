import 'package:equatable/equatable.dart';

class User extends Equatable {
  const User({
    required this.id,
    required this.email,
    required this.fullName,
    required this.role,
    this.department,
    this.avatarUrl,
  });

  final String id;
  final String email;
  final String fullName;
  final String role;
  final String? department;
  final String? avatarUrl;

  @override
  List<Object?> get props => [id, email, fullName, role, department, avatarUrl];
}
