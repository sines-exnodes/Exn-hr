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
    this.department,
    this.contractType, this.numberOfDependents,
    this.bankAccount, this.bankName, this.bankHolderName,
    this.paymentMethod,
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
  final String? department;
  final String? contractType;
  final int? numberOfDependents;
  final String? bankAccount;
  final String? bankName;
  final String? bankHolderName;
  final String? paymentMethod;

  @override
  List<Object?> get props => [id, userId, fullName, email, role];
}
