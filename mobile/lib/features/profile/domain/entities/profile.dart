import 'package:equatable/equatable.dart';

class Profile extends Equatable {
  const Profile({
    required this.id,
    required this.userId,
    required this.fullName,
    required this.email,
    required this.role,
    this.phone,
    this.personalEmail,
    this.dob,
    this.gender,
    this.permanentAddress,
    this.currentAddress,
    this.nationality,
    this.idNumber,
    this.idIssueDate,
    this.idFrontImage,
    this.idBackImage,
    this.education,
    this.maritalStatus,
    this.emergencyContactName,
    this.emergencyContactRelation,
    this.emergencyContactPhone,
    this.joinDate,
    this.departmentId,
    this.departmentName,
    this.managerId,
    this.managerName,
    this.basicSalary,
    this.insuranceSalary,
    this.contractType,
    this.contractSignDate,
    this.contractEndDate,
    this.contractRenewal,
    this.bankAccount,
    this.bankName,
    this.bankHolderName,
    this.paymentMethod,
    this.dependents,
  });

  final int id;
  final int userId;
  final String fullName;
  final String email;
  final String role;
  final String? phone;
  final String? personalEmail;
  final String? dob;
  final String? gender;
  final String? permanentAddress;
  final String? currentAddress;
  final String? nationality;
  final String? idNumber;
  final String? idIssueDate;
  final String? idFrontImage;
  final String? idBackImage;
  final String? education;
  final String? maritalStatus;
  final String? emergencyContactName;
  final String? emergencyContactRelation;
  final String? emergencyContactPhone;
  final String? joinDate;
  final int? departmentId;
  final String? departmentName;
  final int? managerId;
  final String? managerName;
  final double? basicSalary;
  final double? insuranceSalary;
  final String? contractType;
  final String? contractSignDate;
  final String? contractEndDate;
  final int? contractRenewal;
  final String? bankAccount;
  final String? bankName;
  final String? bankHolderName;
  final String? paymentMethod;
  final List<ProfileDependent>? dependents;

  @override
  List<Object?> get props => [id, userId, fullName, email, role];
}

class ProfileDependent extends Equatable {
  const ProfileDependent({
    required this.id,
    required this.employeeId,
    required this.fullName,
    this.dob,
    this.gender,
    this.relationship,
  });

  final int id;
  final int employeeId;
  final String fullName;
  final String? dob;
  final String? gender;
  final String? relationship;

  @override
  List<Object?> get props => [id, employeeId, fullName];
}
