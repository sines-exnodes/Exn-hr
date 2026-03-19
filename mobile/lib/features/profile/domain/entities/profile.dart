import 'package:equatable/equatable.dart';

class Profile extends Equatable {
  const Profile({
    required this.id,
    required this.email,
    required this.fullName,
    required this.role,
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
  final String fullName;
  final String role;
  final String? phone;
  final String? department;
  final String? teamId;
  final String? teamName;
  final String? avatarUrl;
  final String? dateOfBirth;
  final String? joinDate;
  final String? address;

  @override
  List<Object?> get props => [id, email, fullName, role, phone, department, teamId];
}
