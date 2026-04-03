class ProfileModel {
  const ProfileModel({
    required this.id,
    required this.userId,
    required this.fullName,
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
    this.managerId,
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
    this.user,
    this.department,
    this.manager,
    this.dependents,
  });

  final int id;
  final int userId;
  final String fullName;
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
  final int? managerId;
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
  final ProfileUserModel? user;
  final ProfileDepartmentModel? department;
  final ProfileManagerModel? manager;
  final List<ProfileDependentModel>? dependents;

  String get email => user?.email ?? '';
  String get role => user?.role ?? 'employee';

  factory ProfileModel.fromJson(Map<String, dynamic> json) {
    return ProfileModel(
      id: json['id'] as int,
      userId: json['user_id'] as int,
      fullName: json['full_name'] as String? ?? '',
      phone: json['phone'] as String?,
      personalEmail: json['personal_email'] as String?,
      dob: json['dob'] as String?,
      gender: json['gender'] as String?,
      permanentAddress: json['permanent_address'] as String?,
      currentAddress: json['current_address'] as String?,
      nationality: json['nationality'] as String?,
      idNumber: json['id_number'] as String?,
      idIssueDate: json['id_issue_date'] as String?,
      idFrontImage: json['id_front_image'] as String?,
      idBackImage: json['id_back_image'] as String?,
      education: json['education'] as String?,
      maritalStatus: json['marital_status'] as String?,
      emergencyContactName: json['emergency_contact_name'] as String?,
      emergencyContactRelation: json['emergency_contact_relation'] as String?,
      emergencyContactPhone: json['emergency_contact_phone'] as String?,
      joinDate: json['join_date'] as String?,
      departmentId: json['department_id'] as int?,
      managerId: json['manager_id'] as int?,
      basicSalary: (json['basic_salary'] as num?)?.toDouble(),
      insuranceSalary: (json['insurance_salary'] as num?)?.toDouble(),
      contractType: json['contract_type'] as String?,
      contractSignDate: json['contract_sign_date'] as String?,
      contractEndDate: json['contract_end_date'] as String?,
      contractRenewal: json['contract_renewal'] as int?,
      bankAccount: json['bank_account'] as String?,
      bankName: json['bank_name'] as String?,
      bankHolderName: json['bank_holder_name'] as String?,
      paymentMethod: json['payment_method'] as String?,
      user: json['user'] != null
          ? ProfileUserModel.fromJson(json['user'] as Map<String, dynamic>)
          : null,
      department: json['department'] != null
          ? ProfileDepartmentModel.fromJson(
              json['department'] as Map<String, dynamic>)
          : null,
      manager: json['manager'] != null
          ? ProfileManagerModel.fromJson(
              json['manager'] as Map<String, dynamic>)
          : null,
      dependents: (json['dependents'] as List<dynamic>?)
          ?.map((e) =>
              ProfileDependentModel.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}

class ProfileUserModel {
  const ProfileUserModel({
    required this.id,
    required this.email,
    required this.role,
    required this.isActive,
  });

  final int id;
  final String email;
  final String role;
  final bool isActive;

  factory ProfileUserModel.fromJson(Map<String, dynamic> json) {
    return ProfileUserModel(
      id: json['id'] as int,
      email: json['email'] as String,
      role: json['role'] as String? ?? 'employee',
      isActive: json['is_active'] as bool? ?? true,
    );
  }
}

class ProfileDepartmentModel {
  const ProfileDepartmentModel({
    required this.id,
    required this.name,
    this.description,
  });

  final int id;
  final String name;
  final String? description;

  factory ProfileDepartmentModel.fromJson(Map<String, dynamic> json) {
    return ProfileDepartmentModel(
      id: json['id'] as int,
      name: json['name'] as String,
      description: json['description'] as String?,
    );
  }
}

class ProfileManagerModel {
  const ProfileManagerModel({
    required this.id,
    required this.fullName,
  });

  final int id;
  final String fullName;

  factory ProfileManagerModel.fromJson(Map<String, dynamic> json) {
    return ProfileManagerModel(
      id: json['id'] as int,
      fullName: json['full_name'] as String? ?? '',
    );
  }
}

class ProfileDependentModel {
  const ProfileDependentModel({
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

  factory ProfileDependentModel.fromJson(Map<String, dynamic> json) {
    return ProfileDependentModel(
      id: json['id'] as int,
      employeeId: json['employee_id'] as int,
      fullName: json['full_name'] as String? ?? '',
      dob: json['dob'] as String?,
      gender: json['gender'] as String?,
      relationship: json['relationship'] as String?,
    );
  }
}
