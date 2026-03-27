class ProfileModel {
  const ProfileModel({
    required this.id,
    required this.userId,
    required this.fullName,
    this.phone,
    this.address,
    this.dob,
    this.gender,
    this.joinDate,
    this.position,
    this.teamId,
    this.basicSalary,
    this.insuranceSalary,
    this.contractType,
    this.numberOfDependents,
    this.bankAccount,
    this.bankName,
    this.bankHolderName,
    this.paymentMethod,
    this.user,
    this.team,
  });

  final int id;
  final int userId;
  final String fullName;
  final String? phone;
  final String? address;
  final String? dob;
  final String? gender;
  final String? joinDate;
  final String? position;
  final int? teamId;
  final double? basicSalary;
  final double? insuranceSalary;
  final String? contractType;
  final int? numberOfDependents;
  final String? bankAccount;
  final String? bankName;
  final String? bankHolderName;
  final String? paymentMethod;
  final ProfileUserModel? user;
  final ProfileTeamModel? team;

  String get email => user?.email ?? '';
  String get role => user?.role ?? 'employee';

  factory ProfileModel.fromJson(Map<String, dynamic> json) {
    return ProfileModel(
      id: json['id'] as int,
      userId: json['user_id'] as int,
      fullName: json['full_name'] as String? ?? '',
      phone: json['phone'] as String?,
      address: json['address'] as String?,
      dob: json['dob'] as String?,
      gender: json['gender'] as String?,
      joinDate: json['join_date'] as String?,
      position: json['position'] as String?,
      teamId: json['team_id'] as int?,
      basicSalary: (json['basic_salary'] as num?)?.toDouble(),
      insuranceSalary: (json['insurance_salary'] as num?)?.toDouble(),
      contractType: json['contract_type'] as String?,
      numberOfDependents: json['number_of_dependents'] as int?,
      bankAccount: json['bank_account'] as String?,
      bankName: json['bank_name'] as String?,
      bankHolderName: json['bank_holder_name'] as String?,
      paymentMethod: json['payment_method'] as String?,
      user: json['user'] != null
          ? ProfileUserModel.fromJson(json['user'] as Map<String, dynamic>)
          : null,
      team: json['team'] != null
          ? ProfileTeamModel.fromJson(json['team'] as Map<String, dynamic>)
          : null,
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

class ProfileTeamModel {
  const ProfileTeamModel({
    required this.id,
    required this.name,
    this.departmentId,
  });

  final int id;
  final String name;
  final int? departmentId;

  factory ProfileTeamModel.fromJson(Map<String, dynamic> json) {
    return ProfileTeamModel(
      id: json['id'] as int,
      name: json['name'] as String,
      departmentId: json['department_id'] as int?,
    );
  }
}
