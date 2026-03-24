import 'package:equatable/equatable.dart';

class Profile extends Equatable {
  const Profile({
    required this.id,
    required this.userId,
    required this.fullName,
    required this.email,
    required this.role,
    this.phone, this.address, this.dob, this.gender,
    this.joinDate, this.position, this.teamId, this.teamName,
    this.basicSalary, this.insuranceSalary,
  });

  final int id;
  final int userId;
  final String fullName;
  final String email;
  final String role;
  final String? phone;
  final String? address;
  final String? dob;
  final String? gender;
  final String? joinDate;
  final String? position;
  final int? teamId;
  final String? teamName;
  final double? basicSalary;
  final double? insuranceSalary;

  @override
  List<Object?> get props => [id, userId, fullName, email, role];
}
